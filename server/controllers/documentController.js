// Reminder: Add GEMINI_API_KEY=your_key_here to your .env file
const db         = require('../config/db');
const path       = require('path');
const fs         = require('fs');
const cloudinary = require('../config/cloudinary');
const Tesseract  = require('tesseract.js');
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

    // Step A — OCR extraction:
    const { data: { text } } = await Tesseract.recognize(cloudinaryResult.secure_url, 'eng');

    // Step B — AI validation via Google Gemini API:
    const aiCheckResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Expected document type: "${doc_type}". Extracted text from uploaded document: """${text}""". Does this text match the expected document type? Respond ONLY with valid JSON, no other text, no markdown formatting: {"isValidType": true or false, "reason": "short explanation"}`
                    }]
                }]
            })
        }
    );

    if (!aiCheckResponse.ok) {
        const errorBody = await aiCheckResponse.text();
        console.error('Gemini API error body:', errorBody);
        throw new Error(`Gemini API returned status ${aiCheckResponse.status}`);
    }

    const responseData = await aiCheckResponse.json();
    if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content || !responseData.candidates[0].content.parts || !responseData.candidates[0].content.parts[0]) {
        throw new Error('Invalid response structure from Gemini API');
    }

    const aiText = responseData.candidates[0].content.parts[0].text;
    let cleanedText = aiText.trim();
    if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }
    const aiResult = JSON.parse(cleanedText);

    if (aiResult.isValidType === false) {
        // Delete the file from Cloudinary
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);

        // Delete the local temp file
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Failed to delete local file:', err);
        });

        return res.status(400).json({
            message: 'Document does not match the selected type',
            reason: aiResult.reason
        });
    }

    // If validation succeeds, delete local temp file and proceed
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
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            if (err && err.code !== 'ENOENT') console.error('Failed to clean up local file:', err);
        });
    }
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