const express  = require('express');
const router   = express.Router();
const {
  createScheme, getSchemes, getSchemeById, updateScheme, deleteScheme
} = require('../controllers/schemeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateScheme } = require('../middleware/validationMiddleware');

// public to all logged-in users
router.get('/',    authMiddleware, getSchemes);
router.get('/:id', authMiddleware, getSchemeById);

// admin only
router.post('/',      authMiddleware, roleMiddleware('admin'), validateScheme, createScheme);
router.put('/:id',    authMiddleware, roleMiddleware('admin'), validateScheme, updateScheme);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteScheme);

module.exports = router;