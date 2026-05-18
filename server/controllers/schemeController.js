const db = require('../config/db');

// POST /api/schemes  — admin adds a new scheme
const createScheme = async (req, res) => {
    const { title, description, required_docs } = req.body;

    if (!title || !required_docs || !Array.isArray(required_docs) || required_docs.length === 0) {
    return res.status(400).json({ message: 'Title and required_docs array are required' });
    }

    try {
    const [result] = await db.query(
        `INSERT INTO schemes (title, description, required_docs, created_by)
        VALUES (?, ?, ?, ?)`,
        [title, description || null, JSON.stringify(required_docs), req.user.id]
    );

    return res.status(201).json({
        message: 'Scheme created successfully',
        schemeId: result.insertId
    });

    } catch (err) {
    console.error('Create scheme error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/schemes  — all active schemes (citizen + admin)
const getSchemes = async (req, res) => {
    try {
    const [rows] = await db.query(
        `SELECT id, title, description, required_docs, is_active, created_at
        FROM schemes WHERE is_active = true ORDER BY created_at DESC`
    );
    return res.status(200).json(rows);
    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/schemes/:id  — single scheme detail
const getSchemeById = async (req, res) => {
    try {
    const [rows] = await db.query(
      'SELECT * FROM schemes WHERE id = ?',
        [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Scheme not found' });
    }

    return res.status(200).json(rows[0]);

    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/schemes/:id  — admin updates a scheme
const updateScheme = async (req, res) => {
    const { title, description, required_docs, is_active } = req.body;

    try {
    const [rows] = await db.query(
        'SELECT id FROM schemes WHERE id = ?', [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Scheme not found' });
    }

    await db.query(
        `UPDATE schemes
        SET title = COALESCE(?, title),
            description = COALESCE(?, description),
            required_docs = COALESCE(?, required_docs),
            is_active = COALESCE(?, is_active)
        WHERE id = ?`,
        [
        title || null,
        description || null,
        required_docs ? JSON.stringify(required_docs) : null,
        is_active !== undefined ? is_active : null,
        req.params.id
        ]
    );

    return res.status(200).json({ message: 'Scheme updated successfully' });

    } catch (err) {
    console.error('Update scheme error:', err.message);
    return res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/schemes/:id  — admin deletes a scheme
const deleteScheme = async (req, res) => {
    try {
    const [rows] = await db.query(
        'SELECT id FROM schemes WHERE id = ?', [req.params.id]
    );

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Scheme not found' });
    }

    await db.query('DELETE FROM schemes WHERE id = ?', [req.params.id]);

    return res.status(200).json({ message: 'Scheme deleted successfully' });

    } catch (err) {
    return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createScheme, getSchemes, getSchemeById, updateScheme, deleteScheme };