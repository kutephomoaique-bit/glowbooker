import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function createAdmin() {
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    // Create admin account
    const hashedPassword = await hashPassword('homebase2024');
    
    await sql`
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
        role = 'ADMIN'
    `;
    
    console.log('✅ Admin account created successfully!');
    console.log('Email: admin@homebase.beauty');
    console.log('Password: homebase2024');
    
    // Also ensure the original admin has admin rights
    await sql`
      UPDATE users SET role = 'ADMIN' 
      WHERE email = 'kutephomoaique@gmail.com'
    `;
    
    console.log('✅ Original admin account updated!');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
}

createAdmin();