const db = require('../config/db');

// GET /api/admin/reports/summary
const getSummary = async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as active FROM users WHERE role = "citizen"');
        const [apps] = await db.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected FROM applications');

        res.json({
            users: {
                total: users[0].total || 0,
                active: users[0].active || 0,
            },
            applications: {
                total: apps[0].total || 0,
                approved: apps[0].approved || 0,
                pending: apps[0].pending || 0,
                rejected: apps[0].rejected || 0,
            }
        });
    } catch (err) {
        console.error('Error fetching summary:', err);
        res.status(500).json({ message: 'Server error fetching reports' });
    }
};

// GET /api/admin/reports/periodic
const getPeriodicReport = async (req, res) => {
    const period = req.query.period || 'monthly';
    
    // Group by day for weekly, month for monthly/quarterly/yearly
    let format = '%Y-%m-%d';
    let limit = 7;
    
    if (period === 'monthly') {
        format = '%Y-%m-%d';
        limit = 30;
    } else if (period === 'quarterly') {
        format = '%Y-%m';
        limit = 3;
    } else if (period === 'yearly') {
        format = '%Y-%m';
        limit = 12;
    }

    try {
        const query = `
            SELECT DATE_FORMAT(applied_at, ?) as label, 
                   SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                   SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                   SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                   SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                   COUNT(*) as total
            FROM applications
            GROUP BY label
            ORDER BY label DESC
            LIMIT ?
        `;
        const [rows] = await db.query(query, [format, limit]);
        const mapped = rows.reverse().map(r => ({
             label: r.label,
             total: Number(r.total) || 0,
             approved: Number(r.approved) || 0,
             pending: Number(r.pending) || 0,
             rejected: Number(r.rejected) || 0,
             in_progress: Number(r.in_progress) || 0
        }));
        res.json(mapped);
    } catch (err) {
        console.error('Error fetching periodic report:', err);
        res.status(500).json({ message: 'Server error fetching periodic report' });
    }
};

// GET /api/admin/reports/schemes
const getSchemeReport = async (req, res) => {
    try {
        const query = `
            SELECT s.title as scheme_name,
                   COUNT(a.id) as total,
                   SUM(CASE WHEN a.status = 'approved' THEN 1 ELSE 0 END) as approved,
                   SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending,
                   SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM schemes s
            LEFT JOIN applications a ON s.id = a.scheme_id
            GROUP BY s.id
            ORDER BY total DESC
        `;
        const [rows] = await db.query(query);
        // Ensure values are numbers (MySQL SUM might return string)
        const parsedRows = rows.map(r => ({
            ...r,
            total: Number(r.total),
            approved: Number(r.approved),
            pending: Number(r.pending),
            rejected: Number(r.rejected),
        }));
        res.json(parsedRows);
    } catch (err) {
        console.error('Error fetching scheme report:', err);
        res.status(500).json({ message: 'Server error fetching scheme report' });
    }
};

// GET /api/admin/reports/applications
const getUserApplicationsReport = async (req, res) => {
    try {
        const query = `
            SELECT a.id, u.name as citizen_name, u.email as citizen_email, 
                   s.title as scheme_title, a.status, a.applied_at, a.updated_at as processed_at
            FROM applications a
            JOIN users u ON a.user_id = u.id
            JOIN schemes s ON a.scheme_id = s.id
            ORDER BY a.applied_at DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching user applications report:', err);
        res.status(500).json({ message: 'Server error fetching user applications report' });
    }
};

module.exports = {
    getSummary,
    getPeriodicReport,
    getSchemeReport,
    getUserApplicationsReport
};
