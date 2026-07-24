'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  if (process.env.ALLOW_SCHEMA_MIGRATION !== 'true') throw new Error('ALLOW_SCHEMA_MIGRATION=true is required');
  execFileSync(path.resolve(__dirname, '../node_modules/.bin/prisma'), ['db', 'push', '--skip-generate'], { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
  execFileSync('psql', [process.env.DATABASE_URL, '-v', 'ON_ERROR_STOP=1'], {
    input: fs.readFileSync(path.resolve(__dirname, '../migrations/001_governed_candidate_screening.sql')),
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  const prisma = require('../src/config/database');
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS recruiter_runtime_ai_results (
      id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL REFERENCES "User"(id), input JSONB NOT NULL,
      result JSONB NOT NULL, model TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = String(process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || '');
    if (!email || password.length < 12) throw new Error('Runtime administrator credentials are required');
    await prisma.user.upsert({
      where: { email },
      create: { email, password: await bcrypt.hash(password, 12), firstName: 'Runtime', lastName: 'Administrator', role: 'admin', emailVerified: true },
      update: { password: await bcrypt.hash(password, 12), firstName: 'Runtime', lastName: 'Administrator', role: 'admin', emailVerified: true },
    });
  } finally { await prisma.$disconnect(); }
}

main().catch((error) => { console.error(error.message); process.exit(1); });
