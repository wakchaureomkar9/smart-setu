const express    = require('express');
const router     = express.Router();
const { uploadDocument, getDocuments, deleteDocument } = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, checkQuota } = require('../middleware/uploadMiddleware');

router.post('/upload', authMiddleware, checkQuota, upload.single('file'), uploadDocument);
router.get('/',        authMiddleware, getDocuments);
router.delete('/:id',  authMiddleware, deleteDocument);

router.get('/test', (req, res) => {
    res.json({ message: 'Document routes working' });
});

module.exports = router;