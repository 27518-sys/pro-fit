const fs = require('fs');
const path = require('path');

const dbUrl = process.env.DATABASE_URL || '';
const prismaDir = path.join(__dirname, '..', 'prisma');
const targetSchema = path.join(prismaDir, 'schema.prisma');
const postgresSchema = path.join(prismaDir, 'schema.postgresql.prisma');

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('Detected PostgreSQL / Supabase connection string.');
  console.log('Configuring Prisma for PostgreSQL...');
  if (fs.existsSync(postgresSchema)) {
    fs.copyFileSync(postgresSchema, targetSchema);
    console.log('Successfully set schema.prisma to PostgreSQL provider.');
  }
} else {
  console.log('Using SQLite database configuration.');
}
