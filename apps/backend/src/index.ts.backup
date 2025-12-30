import dotenv from 'dotenv';
import path from 'path';

// Lade .env bevor irgendetwas anderes passiert
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('--- Environment Check ---');
console.log('DB_URL vorhanden:', !!process.env.DATABASE_URL);
console.log('-------------------------');

require('./server');
