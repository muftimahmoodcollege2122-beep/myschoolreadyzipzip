const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcryptjs');
const crypto = require('crypto');

async function seed() {
  const p = new PrismaClient();
  try {
    const ex = await p.tenant.findUnique({ where: { slug: 'demo' } });
    if (ex) { console.log('   Demo exists'); return; }
    const tid = crypto.randomUUID();
    await p.tenant.create({ data: { id: tid, name: 'Demo School', slug: 'demo', tier: 'STARTER', status: 'ACTIVE', schemaName: 'tenant_demo', dataRegion: 'ap-south-1', trialEndsAt: new Date(Date.now()+365*86400000), planLimits: {}, settings: { timezone:'Asia/Karachi', locale:'en', currency:'PKR', academicYear:'2025-2026' } } });
    await p.school.create({ data: { tenantId: tid, name: 'Demo School', code: 'DEMO', address: { country: 'Pakistan' }, email: 'admin@demo.edu', timezone: 'Asia/Karachi', locale: 'en', academicYear: '2025-2026' } });
    const hash = await bcrypt.hash('Admin@123456', 12);
    await p.user.create({ data: { tenantId: tid, email: 'admin@demo.edu', passwordHash: hash, role: 'SCHOOL_ADMIN', emailVerified: true, profile: { create: { firstName: 'Demo', lastName: 'Admin', phone: '+923001234567' } } } });
    console.log('   Seeded: admin@demo.edu / Admin@123456');
  } catch(e) { console.log('   Seed note:', e.message.split('\n')[0]); }
  await p.$disconnect();
}
seed();
