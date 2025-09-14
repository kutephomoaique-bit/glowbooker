// Quick admin setup for production
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

const sql = neon(process.env.DATABASE_URL);
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

console.log('✅ Admin created: admin@homebase.beauty / homebase2024');