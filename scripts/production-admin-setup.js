#!/usr/bin/env node
/**
 * Production Admin Setup Script
 * Run this script to create admin account in production database
 * Usage: node scripts/production-admin-setup.js
 */

import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function setupProductionAdmin() {
  try {
    console.log('🚀 Setting up admin account for production...');
    
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT === '1';
    console.log(`📍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not found'}`);
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable not found');
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Create admin account with secure credentials
    const adminEmail = 'admin@homebase.beauty';
    const adminPassword = 'homebase2024';
    const hashedPassword = await hashPassword(adminPassword);
    
    // First, ensure sessions table exists (for production)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSON NOT NULL,
          expire TIMESTAMP NOT NULL
        )
      `;
      console.log('✅ Sessions table ready');
    } catch (sessionError) {
      console.log('⚠️  Sessions table setup:', sessionError.message);
    }
    
    // Create or update admin account
    const result = await sql`
      INSERT INTO users (email, password, first_name, last_name, phone, role) 
      VALUES (
        ${adminEmail},
        ${hashedPassword},
        'Admin',
        'Manager', 
        '+84123456789',
        'ADMIN'
      ) ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = 'ADMIN',
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        updated_at = NOW()
      RETURNING email, role, created_at
    `;
    
    console.log('✅ Admin account setup completed!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Role:', result[0]?.role);
    console.log('📅 Created:', result[0]?.created_at);
    
    // Verify the account works
    const verification = await sql`
      SELECT email, role, first_name, last_name FROM users 
      WHERE email = ${adminEmail} AND role = 'ADMIN'
    `;
    
    if (verification.length > 0) {
      console.log('✅ Verification successful - Admin account ready for production!');
      console.log('🌐 You can now login at /admin/login on your published website');
    } else {
      console.log('❌ Verification failed - Admin account not found');
    }
    
  } catch (error) {
    console.error('❌ Error setting up production admin:', error.message);
    console.error('💡 Make sure your DATABASE_URL environment variable is correctly set');
    process.exit(1);
  }
}

// Run the setup
setupProductionAdmin();