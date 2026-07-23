/**
 * Bootstraps the platform-level tenant + the first SUPER_ADMIN account.
 *
 * Why this exists: every User row requires a tenantId (see schema.prisma),
 * and /login always asks for a school slug — there was previously no way
 * for a platform operator (not tied to any customer school) to log in at
 * all, because no SUPER_ADMIN account or tenant to hold it ever existed.
 *
 * This creates a dedicated "platform" tenant (excluded from the super-admin
 * schools list/revenue numbers — see the `slug !== PLATFORM_SLUG` filters
 * in tenants.service.ts) and one SUPER_ADMIN user inside it.
 *
 * Idempotent: safe to re-run. Skips creation if the platform tenant or the
 * admin email already exists; use --reset-password to rotate the password
 * on an existing account instead of creating a new one.
 *
 * Usage:
 *   SUPER_ADMIN_EMAIL=you@yourcompany.com SUPER_ADMIN_PASSWORD='...' npm run seed
 *   (both are optional — omit to get a generated email + random password,
 *   printed once to stdout; save it, it is not stored or logged anywhere else)
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

export const PLATFORM_TENANT_SLUG = 'platform';
const BCRYPT_ROUNDS = 12;

function randomPassword(): string {
  return crypto.randomBytes(18).toString('base64url'); // 24-char, URL-safe
}

async function main() {
  const resetPassword = process.argv.includes('--reset-password');
  const email = (process.env.SUPER_ADMIN_EMAIL || 'admin@platform.internal').toLowerCase().trim();
  const passwordProvided = !!process.env.SUPER_ADMIN_PASSWORD;
  const password = process.env.SUPER_ADMIN_PASSWORD || randomPassword();

  let tenant = await prisma.tenant.findUnique({ where: { slug: PLATFORM_TENANT_SLUG } });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Platform Operations',
        slug: PLATFORM_TENANT_SLUG,
        tier: 'ENTERPRISE',
        status: 'ACTIVE',
        schemaName: 'tenant_platform',
        dataRegion: 'ap-south-1',
        planLimits: { maxStudents: 0, maxTeachers: 0, smsEnabled: false, storageGb: 0 },
        settings: { timezone: 'Asia/Karachi', locale: 'en', currency: 'PKR', internal: true },
      },
    });
    console.log(`✅ Created platform tenant (slug: "${PLATFORM_TENANT_SLUG}")`);
  } else {
    console.log(`ℹ️  Platform tenant already exists (slug: "${PLATFORM_TENANT_SLUG}")`);
  }

  // Every operation below touches the User table, which has RLS enabled
  // (see prisma/migrations/manual_rls). Wrap in a transaction that sets the
  // session var first — same pattern the app uses for every real request.
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenant.id}, true)`;

    const existingUser = await tx.user.findUnique({
      where: { tenantId_email: { tenantId: tenant.id, email } },
    });

    if (existingUser && !resetPassword) {
      console.log(`ℹ️  Super admin "${email}" already exists — nothing to do.`);
      console.log(`   Run with --reset-password to rotate its password instead.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    if (existingUser && resetPassword) {
      await tx.user.update({ where: { id: existingUser.id }, data: { passwordHash, isActive: true } });
      console.log(`✅ Password reset for existing super admin "${email}"`);
    } else {
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          email,
          passwordHash,
          role: 'SUPER_ADMIN',
          emailVerified: true,
          profile: { create: { firstName: 'Platform', lastName: 'Admin' } },
        },
      });
      console.log(`✅ Created super admin "${email}"`);
    }
  });

  console.log('\n──────────────────────────────────────────────');
  console.log('Log in at /login with:');
  console.log(`  School Domain: ${PLATFORM_TENANT_SLUG}`);
  console.log(`  Email:         ${email}`);
  if (!passwordProvided) console.log(`  Password:      ${password}  (generated — save this now, it will not be shown again)`);
  else console.log(`  Password:      (the value of SUPER_ADMIN_PASSWORD you set)`);
  console.log('──────────────────────────────────────────────\n');
}

main()
  .catch(e => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
