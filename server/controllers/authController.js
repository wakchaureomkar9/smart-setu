const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');
const sendEmail       = require('../utils/sendEmail');
const { welcomeEmail } = require('../utils/emailTemplates');
const asyncHandler = require('express-async-handler');

// ── REGISTER ────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, address, password } = req.body;

  const [existing] = await db.query(
    'SELECT id FROM users WHERE email = ?', [email]
  );
  if (existing.length > 0) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    `INSERT INTO users (name, email, phone, address, password, role, is_verified)
    VALUES (?, ?, ?, ?, ?, 'citizen', TRUE)`,
    [name, email, phone || null, address || null, hashedPassword]
  );

  sendEmail(email, 'Welcome to Smart Setu Portal', welcomeEmail(name)).catch(err => {
      console.error('Welcome email failed:', err);
  });

  return res.status(201).json({
    message: 'Registration successful',
    userId: result.insertId
  });
});

// ── LOGIN ───────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query(
    'SELECT * FROM users WHERE email = ?', [email]
  );
  if (rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = rows[0];

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id:    user.id,
      name:  user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role:  user.role
    }
  });
});

// ── GET PROFILE ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return res.status(200).json(rows[0]);
});

// ── UPDATE PROFILE ──────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || name.trim().length < 2) {
    const error = new Error('Name must be at least 2 characters');
    error.statusCode = 400;
    throw error;
  }

  await db.query(
    'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
    [name.trim(), phone || null, address || null, req.user.id]
  );

  const [rows] = await db.query(
    'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
    [req.user.id]
  );

  return res.status(200).json({
    message: 'Profile updated successfully',
    user: rows[0]
  });
});

// ── CHANGE PASSWORD ─────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    const error = new Error('Both current and new password are required');
    error.statusCode = 400;
    throw error;
  }

  if (new_password.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (rows.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(current_password, rows[0].password);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 401;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

  return res.status(200).json({ message: 'Password changed successfully' });
});

// ── CITIZEN DASHBOARD STATS ─────────────────────────────
const getCitizenDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [appRows] = await db.query(
    'SELECT status FROM applications WHERE user_id = ?',
    [userId]
  );

  const [docRows] = await db.query(
    'SELECT COUNT(*) AS total FROM documents WHERE user_id = ?',
    [userId]
  );

  const [recentApps] = await db.query(
    `SELECT a.id, a.status, a.applied_at, a.admin_note, a.result_file_url,
            s.title AS scheme_title
     FROM applications a
     JOIN schemes s ON a.scheme_id = s.id
     WHERE a.user_id = ?
     ORDER BY a.applied_at DESC
     LIMIT 5`,
    [userId]
  );

  const stats = {
    totalApplications: appRows.length,
    approved: appRows.filter(a => a.status === 'approved').length,
    pending: appRows.filter(a => a.status === 'pending').length,
    in_progress: appRows.filter(a => a.status === 'in_progress').length,
    rejected: appRows.filter(a => a.status === 'rejected').length,
    totalDocuments: docRows[0].total,
  };

  return res.status(200).json({ stats, recentApplications: recentApps });
});

// ── ADMIN DASHBOARD STATS ───────────────────────────────
const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [userRes] = await db.query("SELECT COUNT(*) AS totalUsers FROM users");
  const [appRes] = await db.query("SELECT COUNT(*) AS totalApplications FROM applications");
  const [pendingRes] = await db.query("SELECT COUNT(*) AS pendingApplications FROM applications WHERE status = 'pending'");
  const [approvedRes] = await db.query("SELECT COUNT(*) AS approvedApplications FROM applications WHERE status = 'approved'");
  const [rejectedRes] = await db.query("SELECT COUNT(*) AS rejectedApplications FROM applications WHERE status = 'rejected'");
  const [inProgressRes] = await db.query("SELECT COUNT(*) AS inProgressApplications FROM applications WHERE status = 'in_progress'");
  const [schemeRes] = await db.query("SELECT COUNT(*) AS activeSchemes FROM schemes");

  return res.status(200).json({
    totalUsers: Number(userRes[0].totalUsers) || 0,
    totalApplications: Number(appRes[0].totalApplications) || 0,
    pendingApplications: Number(pendingRes[0].pendingApplications) || 0,
    approvedApplications: Number(approvedRes[0].approvedApplications) || 0,
    rejectedApplications: Number(rejectedRes[0].rejectedApplications) || 0,
    inProgressApplications: Number(inProgressRes[0].inProgressApplications) || 0,
    activeSchemes: Number(schemeRes[0].activeSchemes) || 0
  });
});

// ── LIST ALL USERS (ADMIN) ──────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
            COUNT(a.id) AS application_count
     FROM users u
     LEFT JOIN applications a ON a.user_id = u.id
     WHERE u.role = 'citizen'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
  return res.status(200).json(rows);
});

module.exports = { register, login, getProfile, updateProfile, changePassword, getCitizenDashboardStats, getAdminDashboardStats, getAllUsers };