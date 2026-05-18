const express      = require('express');
const router       = express.Router();
const { 
  register, login, getProfile, updateProfile, changePassword,
  getCitizenDashboardStats, getAdminDashboardStats, getAllUsers
} = require('../controllers/authController');
const authMiddleware  = require('../middleware/authMiddleware');
const roleMiddleware  = require('../middleware/roleMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.get('/dashboard/stats', authMiddleware, roleMiddleware('citizen'), getCitizenDashboardStats);
router.get('/admin/stats', authMiddleware, roleMiddleware('admin'), getAdminDashboardStats);
router.get('/admin/users', authMiddleware, roleMiddleware('admin'), getAllUsers);

module.exports = router;