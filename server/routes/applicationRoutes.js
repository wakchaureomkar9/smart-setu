const express  = require('express');

const router   = express.Router();

const {
    submitApplication,
    getUserApplications,
    getApplicationById,
    getAllApplications,
    updateApplicationStatus,
    uploadResult,
    downloadResult,
    getApplicationDocuments,
    viewResult
} = require('../controllers/applicationController');

const authMiddleware = require('../middleware/authMiddleware');

const roleMiddleware = require('../middleware/roleMiddleware');

const { upload } = require('../middleware/uploadMiddleware');
const { validateApplication } = require('../middleware/validationMiddleware');

// ─────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────

router.get(
    '/admin/all',
    authMiddleware,
    roleMiddleware('admin'),
    getAllApplications
);

router.patch(
    '/:id/status',
    authMiddleware,
    roleMiddleware('admin'),
    updateApplicationStatus
);

router.patch(
    '/:id/result',
    authMiddleware,
    roleMiddleware('admin'),
    upload.single('file'),
    uploadResult
);

router.get(
    '/admin/:id/documents',
    authMiddleware,
    roleMiddleware('admin'),
    getApplicationDocuments
);


// ─────────────────────────────────────────
// CITIZEN ROUTES
// ─────────────────────────────────────────

router.post(
    '/',
    authMiddleware,
    validateApplication,
    submitApplication
);

router.get(
    '/',
    authMiddleware,
    getUserApplications
);

router.get(
    '/:id',
    authMiddleware,
    getApplicationById
);

router.get(
    '/:id/download',
    authMiddleware,
    downloadResult
);

router.get(
    '/:id/view-result',
    authMiddleware,
    viewResult
);


module.exports = router;