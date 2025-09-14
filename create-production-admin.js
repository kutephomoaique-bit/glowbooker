// Production Admin Creator - Run this after publishing
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createProductionAdmin() {
  try {
    console.log('🔄 Creating admin account for production database...');
    console.log('📍 Database URL:', process.env.DATABASE_URL ? 'Connected' : 'Not found');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Create the main admin account
    const hashedPassword = await hashPassword('homebase2024');
    
    const result = await sql`
      INSERT INTO users (email, password, first_name, last_name, phone, role) 
      VALUES (
        'admin@homebase.beauty',
        ${hashedPassword},
        'Admin',
        'Manager',
        '+84123456789',
        'ADMIN'
      ) ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = 'ADMIN',
        updated_at = NOW()
      RETURNING email, role
    `;
    
    console.log('✅ Production admin account created successfully!');
    console.log('📧 Email: admin@homebase.beauty');
    console.log('🔑 Password: homebase2024');
    console.log('👤 Role:', result[0]?.role);
    
    // Verify the account exists
    const verification = await sql`
      SELECT email, role, created_at FROM users 
      WHERE email = 'admin@homebase.beauty'
    `;
    
    console.log('✅ Verification:', verification[0]);
    
  } catch (error) {
    console.error('❌ Error creating production admin:', error.message);
    console.error('🔧 Make sure your DATABASE_URL is set correctly');
  }
}

createProductionAdmin();