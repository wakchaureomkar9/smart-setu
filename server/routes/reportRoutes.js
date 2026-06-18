const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const {
    getSummary,
    getPeriodicReport,
    getSchemeReport,
    getUserApplicationsReport
} = require('../controllers/reportController');

// All routes require admin
router.use(authMiddleware, roleMiddleware('admin'));

router.get('/summary', getSummary);
router.get('/periodic', getPeriodicReport);
router.get('/schemes', getSchemeReport);
router.get('/applications', getUserApplicationsReport);

module.exports = router;
