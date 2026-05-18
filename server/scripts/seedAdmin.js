/**
 * Run this script once to ensure the admin user exists in the database:
 *   node scripts/seedAdmin.js
 */

const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

async function seedAdmin() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const adminEmail = 'wakchaureomkar189@gmail.com';
  const adminPassword = 'admin123';
  const adminName = 'Admin';

  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

  if (rows.length > 0) {
    // Admin exists — update password & role to make sure it's correct
    const hashed = await bcrypt.hash(adminPassword, 10);
    await db.query(
      "UPDATE users SET password = ?, role = 'admin' WHERE email = ?",
      [hashed, adminEmail]
    );
    console.log('✅ Admin user already exists — password & role updated.');
  } else {
    // Insert admin
    const hashed = await bcrypt.hash(adminPassword, 10);
    await db.query(
      `INSERT INTO users (name, email, password, role, is_verified)
       VALUES (?, ?, ?, 'admin', TRUE)`,
      [adminName, adminEmail, hashed]
    );
    console.log('✅ Admin user created successfully.');
  }

  console.log(`   Email   : ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);

  await db.end();
}

seedAdmin().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
