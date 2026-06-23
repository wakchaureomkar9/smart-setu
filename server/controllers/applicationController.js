const db        = require('../config/db');
const path      = require('path');
const fs        = require('fs');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../utils/sendEmail');
const getSignedFileUrl = require('../utils/getSignedUrl');
const {
    applicationSubmittedEmail,
    applicationInProgressEmail,
    applicationRejectedEmail
} = require('../utils/emailTemplates');

// ── POST /api/applications  — citizen submits application ──────────────────
const submitApplication = async (req, res) => {
    const { scheme_id } = req.body;

    if (!scheme_id) {
    return res.status(400).json({ message: 'scheme_id is required' });
    }

    try {
    // 1. get scheme and its required docs
    const [schemes] = await db.query(
      'SELECT * FROM schemes WHERE id = ? AND is_active = true',
        [scheme_id]
    );

    if (schemes.length === 0) {
        return res.status(404).json({ message: 'Scheme not found or inactive' });
    }

    const scheme = schemes[0];
    const requiredDocs = Array.isArray(scheme.required_docs)
    ? scheme.required_docs
  : JSON.parse(scheme.required_docs); // e.g. ["Aadhaar Card", "Income Certificate"]

    // 2. check user hasn't already applied with a non-rejected status
    const [existing] = await db.query(
        'SELECT id FROM applications WHERE user_id = ? AND scheme_id = ? AND status != ?',
        [req.user.id, scheme_id, 'rejected']
    );

    if (existing.length > 0) {
        return res.status(409).json({ message: 'You have already applied for this scheme' });
    }

    // 3. auto-match — find user documents that match required types
    const [matchedDocs] = await db.query(
      `SELECT * FROM documents
        WHERE user_id = ? AND doc_type IN (?)`,
        [req.user.id, requiredDocs]
    );

    // 4. check which required docs are missing
    const uploadedTypes  = matchedDocs.map(d => d.doc_type);
    const missingDocs    = requiredDocs.filter(r => !uploadedTypes.includes(r));

    if (missingDocs.length > 0) {
        return res.status(400).json({
        message: 'Some required documents are missing from your vault',
        missing: missingDocs
        });
    }

    // 5. create application
    const [appResult] = await db.query(
        `INSERT INTO applications (user_id, scheme_id, status)
        VALUES (?, ?, 'pending')`,
        [req.user.id, scheme_id]
    );

    const applicationId = appResult.insertId;

    // 6. link matched documents to this application
    const docInserts = matchedDocs.map(doc => [applicationId, doc.id]);
    await db.query(
        'INSERT INTO application_documents (application_id, document_id) VALUES ?',
        [docInserts]
    );

    // 7. send confirmation email
    sendEmail(
        req.user.email,
        'Application Submitted - Smart Setu',
        applicationSubmittedEmail(req.user.name, scheme.title, applicationId)
    ).catch(err => console.error('Email failed:', err));

    return res.status(201).json({
        message: 'Application submitted successfully',
        application_id: applicationId,
        matched_documents: matchedDocs.map(d => ({ id: d.id, doc_type: d.doc_type, file_url: d.file_url }))
    });

    } catch (err) {
    console.error('Submit application error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/applications  — citizen sees their own applications ───────────
const getUserApplications = async (req, res) => {
    try {
    const [rows] = await db.query(
        `SELECT a.id, a.status, a.admin_note, a.result_file_url,
                a.applied_at, a.updated_at,
                s.title AS scheme_title, s.description AS scheme_description
        FROM applications a
        JOIN schemes s ON a.scheme_id = s.id
        WHERE a.user_id = ?
        ORDER BY a.applied_at DESC`,
        [req.user.id]
    );
    return res.status(200).json(rows);
    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/applications/:id  — get single application with documents ─────
const getApplicationById = async (req, res) => {
    try {
    const [rows] = await db.query(
        `SELECT a.*, s.title AS scheme_title, s.required_docs
        FROM applications a
        JOIN schemes s ON a.scheme_id = s.id
        WHERE a.id = ?`,
        [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
    }

    const application = rows[0];

    // security — citizen can only see their own, admin sees all
    if (req.user.role === 'citizen' && application.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // fetch linked documents
    const [docs] = await db.query(
        `SELECT d.id, d.doc_type, d.file_name, d.file_url
        FROM application_documents ad
        JOIN documents d ON ad.document_id = d.id
        WHERE ad.application_id = ?`,
        [req.params.id]
    );

    return res.status(200).json({ ...application, documents: docs });

    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/applications/admin/all  — admin sees all applications ─────────
const getAllApplications = async (req, res) => {
    try {
    const [rows] = await db.query(
        `SELECT a.id, a.status, a.applied_at, a.updated_at,
                u.name AS citizen_name, u.email AS citizen_email, u.phone AS citizen_phone,
                s.title AS scheme_title
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN schemes s ON a.scheme_id = s.id
        ORDER BY a.applied_at DESC`
    );
    return res.status(200).json(rows);
    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── PATCH /api/applications/:id/status  — admin updates status ────────────
const updateApplicationStatus = async (req, res) => {
    const { status, admin_note } = req.body;
    const validStatuses = ['pending', 'in_progress', 'approved', 'rejected'];

    if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    try {
    const [rows] = await db.query(
        `SELECT a.*, u.email AS citizen_email, u.name AS citizen_name, s.title AS scheme_title
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN schemes s ON a.scheme_id = s.id
        WHERE a.id = ?`,
        [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
    }

    const app = rows[0];

    await db.query(
        `UPDATE applications
        SET status = ?, admin_note = COALESCE(?, admin_note), processed_by = ?
        WHERE id = ?`,
        [status, admin_note || null, req.user.id, req.params.id]
    );

    // send correct email based on new status
    if (status === 'in_progress') {
        sendEmail(
        app.citizen_email,
        'Application In Progress - Smart Setu',
        applicationInProgressEmail(app.citizen_name, app.scheme_title, app.id)
        ).catch(err => console.error('Email failed:', err));
    }

    if (status === 'rejected') {
        sendEmail(
        app.citizen_email,
        'Application Rejected - Smart Setu',
        applicationRejectedEmail(app.citizen_name, app.scheme_title, app.id, admin_note)
        ).catch(err => console.error('Email failed:', err));
    }

    return res.status(200).json({ message: 'Application status updated' });

    } catch (err) {
    console.error('Update status error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── PATCH /api/applications/:id/result  — admin uploads result file ────────
const uploadResult = async (req, res) => {
    try {
    if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
    }

    const [rows] = await db.query(
        `SELECT a.*, u.email AS citizen_email, u.name AS citizen_name, s.title AS scheme_title
        FROM applications a
        JOIN users u ON a.user_id = u.id
        JOIN schemes s ON a.scheme_id = s.id
        WHERE a.id = ?`,
        [req.params.id]
    );

    if (rows.length === 0) {
      // clean up uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Application not found' });
    }

    const app       = rows[0];
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'smart-setu/results',
        resource_type: 'auto',
        type: 'authenticated'
    });

    fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete local file:', err);
    });

    const resultUrl = cloudinaryResult.secure_url;

    await db.query(
        `UPDATE applications
        SET result_file_url = ?, status = 'approved', processed_by = ?, result_cloudinary_public_id = ?
        WHERE id = ?`,
        [resultUrl, req.user.id, cloudinaryResult.public_id, req.params.id]
    );

    // Email notification removed for result delivery

    return res.status(200).json({
        message: 'Result uploaded and application approved',
        result_file_url: resultUrl
    });

    } catch (err) {
    console.error('Upload result error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/applications/:id/download  — download result document ────────
const downloadResult = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.* FROM applications a WHERE a.id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const app = rows[0];

        // Security check
        if (req.user.role === 'citizen' && app.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        if (!app.result_file_url) {
            return res.status(404).json({ message: 'Result document not found' });
        }

        return res.redirect(app.result_file_url);
    } catch (err) {
        console.error('Download result error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

// ── GET /api/admin/applications/:id/documents — admin fetches applicant docs ──
const getApplicationDocuments = async (req, res) => {
    try {
    const applicationId = req.params.id;

    // verify application exists
    const [apps] = await db.query(
        'SELECT id, user_id FROM applications WHERE id = ?',
        [applicationId]
    );

    if (apps.length === 0) {
        return res.status(404).json({ message: 'Application not found' });
    }

    // fetch all linked documents
    const [docs] = await db.query(
        `SELECT d.id, d.doc_type, d.file_name, d.file_url, d.file_size, d.uploaded_at
         FROM application_documents ad
         JOIN documents d ON ad.document_id = d.id
         WHERE ad.application_id = ?
         ORDER BY d.uploaded_at DESC`,
        [applicationId]
    );

    return res.status(200).json({ documents: docs });

    } catch (err) {
    console.error('Get application documents error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

const viewResult = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const app = rows[0];

        if (req.user.role === 'citizen' && app.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this result' });
        }

        if (!app.result_cloudinary_public_id) {
            return res.status(404).json({ message: 'Result document not found' });
        }

        // Derive a filename-like string from the public_id to determine file extension for the signed URL helper
        const fileNameForExtension = app.result_file_url || 'result.pdf';
        const signedUrl = getSignedFileUrl(app.result_cloudinary_public_id, fileNameForExtension);
        return res.status(200).json({ url: signedUrl });

    } catch (err) {
        console.error('View result error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitApplication,
    getUserApplications,
    getApplicationById,
    getAllApplications,
    updateApplicationStatus,
    uploadResult,
    downloadResult,
    getApplicationDocuments,
    viewResult
};