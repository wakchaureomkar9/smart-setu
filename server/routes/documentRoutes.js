const express    = require('express');
const router     = express.Router();
const { uploadDocument, getDocuments, deleteDocument, viewDocument } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, checkQuota } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post('/upload', authMiddleware, checkQuota, uploadLimiter, upload.single('file'), uploadDocument);
router.get('/',        authMiddleware, getDocuments);
router.delete('/:id',  authMiddleware, deleteDocument);
router.get('/:id/view', authMiddleware, viewDocument);

router.get('/test', (req, res) => {
    res.json({ message: 'Document routes working' });
});

module.exports = router;