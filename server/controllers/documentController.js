const db         = require('../config/db');
const path       = require('path');
const fs         = require('fs');
const cloudinary = require('../config/cloudinary');
const sendEmail  = require('../utils/sendEmail');
const { documentUploadedEmail } = require('../utils/emailTemplates');

// POST /api/documents/upload
const uploadDocument = async (req, res) => {
    try {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { doc_type } = req.body;
    if (!doc_type) {
        return res.status(400).json({ message: 'Document type is required' });
    }

    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'smart-setu/documents',
        resource_type: 'auto'
    });

    fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete local file:', err);
    });

    const fileUrl = cloudinaryResult.secure_url;

    await db.query(
        `INSERT INTO documents (user_id, doc_type, file_name, file_url, file_size)
        VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, doc_type, req.file.originalname, fileUrl, req.file.size]
    );

    // send email (non-blocking)
    sendEmail(
        req.user.email,
        'Document Uploaded - Smart Setu',
        documentUploadedEmail(req.user.name, doc_type)
    ).catch(err => console.error('Email failed:', err));

    return res.status(201).json({
        message: 'Document uploaded successfully',
        file_url: fileUrl
    });

    } catch (err) {
    console.error('Upload error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/documents
const getDocuments = async (req, res) => {
    try {
    const [rows] = await db.query(
      'SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
        [req.user.id]
    );
    return res.status(200).json(rows);
    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/documents/:id
const deleteDocument = async (req, res) => {
    try {
    const [rows] = await db.query(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
        [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
    }

    const doc = rows[0];

    // delete file from disk
    const filePath = path.join(__dirname, '..', doc.file_url);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM documents WHERE id = ?', [doc.id]);

    return res.status(200).json({ message: 'Document deleted successfully' });

    } catch (err) {
    console.error('Delete error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };