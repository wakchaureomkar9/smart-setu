const multer = require('multer');
const path   = require('path');
const db     = require('../config/db');

const MAX_FILE_SIZE  = 10 * 1024 * 1024;        // 10 MB per file
const MAX_USER_QUOTA = 100 * 1024 * 1024;        // 100 MB per user

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
    // Sanitize extension and strictly limit it
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^a-z0-9.]/g, '');
    const unique = `${req.user.id}_${Date.now()}${ext}`;
    cb(null, unique);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
    cb(null, true);
    } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
    }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Quota check middleware — run this BEFORE the multer upload
const checkQuota = async (req, res, next) => {
    try {
    const [rows] = await db.query(
        'SELECT COALESCE(SUM(file_size), 0) AS total FROM documents WHERE user_id = ?',
        [req.user.id]
    );
    const used = Number(rows[0].total);
    if (used >= MAX_USER_QUOTA) {
        return res.status(400).json({ message: 'Storage quota exceeded (100 MB limit)' });
    }
    next();
    } catch (err) {
    return res.status(500).json({ message: 'Server error during quota check' });
    }
};

module.exports = { upload, checkQuota };