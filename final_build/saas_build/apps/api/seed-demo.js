/* eslint-disable */
'use strict';
const { PrismaClient } = require('./node_modules/@prisma/client');
const bcrypt = require('./node_modules/bcryptjs');

const p = new PrismaClient({ log: ['warn', 'error'] });

const TENANT_ID = 'e980e87c-9b10-4bc0-a6ad-15c03b3f59a2';
const ACADEMIC_YEAR = '2025-2026';

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // ── 1. School ────────────────────────────────────────────────────────────────
  let school = await p.school.findFirst({ where: { tenantId: TENANT_ID } });
  if (!school) {
    school = await p.school.create({
      data: {
        tenantId: TENANT_ID,
        name: 'Demo Academy',
        code: 'DEMO01',
        address: { street: '123 Education Lane', city: 'Demo City', country: 'US', zip: '12345' },
        phone: '+1-555-000-0001',
        email: 'info@demoacademy.edu',
        website: 'https://demoacademy.edu',
        timezone: 'America/New_York',
        locale: 'en',
        academicYear: ACADEMIC_YEAR,
      },
    });
    console.log('✅ School created:', school.name);
  } else {
    console.log('ℹ️  School exists:', school.name);
  }
  const SCHOOL_ID = school.id;

  // ── 2. Admin user (for marking attendance etc.) ───────────────────────────
  const adminUser = await p.user.findFirst({ where: { tenantId: TENANT_ID, email: 'admin@demo.edu' } });
  const ADMIN_USER_ID = adminUser?.id;
  if (!ADMIN_USER_ID) throw new Error('Admin user not found — run the main seed first');

  // ── 3. Department ────────────────────────────────────────────────────────────
  let dept = await p.department.findFirst({ where: { tenantId: TENANT_ID, schoolId: SCHOOL_ID } });
  if (!dept) {
    dept = await p.department.create({
      data: {
        tenantId: TENANT_ID,
        schoolId: SCHOOL_ID,
        name: 'General Studies',
        code: 'GEN',
        headId: null,
      },
    });
    console.log('✅ Department created:', dept.name);
  }
  const DEPT_ID = dept.id;

  // ── 4. Classes (Grade 6–10) ───────────────────────────────────────────────
  const classNames = [
    { name: 'Grade 6', level: 6 },
    { name: 'Grade 7', level: 7 },
    { name: 'Grade 8', level: 8 },
    { name: 'Grade 9', level: 9 },
    { name: 'Grade 10', level: 10 },
  ];
  const classMap = {};
  for (const cls of classNames) {
    let c = await p.class.findFirst({ where: { schoolId: SCHOOL_ID, name: cls.name, academicYear: ACADEMIC_YEAR } });
    if (!c) {
      c = await p.class.create({
        data: {
          tenantId: TENANT_ID,
          schoolId: SCHOOL_ID,
          departmentId: DEPT_ID,
          name: cls.name,
          level: cls.level,
          academicYear: ACADEMIC_YEAR,
        },
      });
    }
    classMap[cls.name] = c.id;
  }
  console.log('✅ Classes ready:', Object.keys(classMap).join(', '));

  // ── 5. Sections (A + B per class) ────────────────────────────────────────
  const sectionMap = {}; // classId -> [sectionId_A, sectionId_B]
  for (const [className, classId] of Object.entries(classMap)) {
    sectionMap[classId] = [];
    for (const secName of ['A', 'B']) {
      let s = await p.section.findFirst({ where: { classId, name: secName } });
      if (!s) {
        s = await p.section.create({
          data: {
            tenantId: TENANT_ID,
            schoolId: SCHOOL_ID,
            classId,
            name: secName,
            capacity: 30,
            roomNumber: `${className.replace('Grade ', '')}${secName}`,
          },
        });
      }
      sectionMap[classId].push(s.id);
    }
  }
  console.log('✅ Sections ready (2 per class)');

  // ── 6. Teachers (5 teachers) ─────────────────────────────────────────────
  const teacherData = [
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@demo.edu', employeeId: 'EMP001', subject: 'Mathematics' },
    { firstName: 'Michael', lastName: 'Chen', email: 'michael.c@demo.edu', employeeId: 'EMP002', subject: 'Science' },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.d@demo.edu', employeeId: 'EMP003', subject: 'English' },
    { firstName: 'Robert', lastName: 'Wilson', email: 'robert.w@demo.edu', employeeId: 'EMP004', subject: 'History' },
    { firstName: 'Linda', lastName: 'Martinez', email: 'linda.m@demo.edu', employeeId: 'EMP005', subject: 'Arts' },
  ];
  const teacherIds = [];
  const pwHash = await hash('Teacher@123456');
  for (const td of teacherData) {
    let user = await p.user.findFirst({ where: { tenantId: TENANT_ID, email: td.email } });
    if (!user) {
      user = await p.user.create({
        data: {
          tenantId: TENANT_ID,
          email: td.email,
          passwordHash: pwHash,
          role: 'TEACHER',
          emailVerified: true,
          profile: {
            create: {
              firstName: td.firstName,
              lastName: td.lastName,
              phone: `+1-555-${Math.floor(1000000 + Math.random() * 9000000)}`,
            },
          },
        },
      });
    }
    let teacher = await p.teacher.findFirst({ where: { userId: user.id } });
    if (!teacher) {
      teacher = await p.teacher.create({
        data: {
          tenantId: TENANT_ID,
          schoolId: SCHOOL_ID,
          userId: user.id,
          employeeId: td.employeeId,
          departmentId: DEPT_ID,
          qualifications: [{ degree: 'M.Ed', institution: 'State University', year: 2015 }],
          specializations: [td.subject],
          joiningDate: new Date('2022-08-01'),
          salary: 45000,
          isActive: true,
        },
      });
    }
    teacherIds.push(teacher.id);
  }
  console.log(`✅ Teachers ready: ${teacherData.length}`);

  // ── 7. Students (25 students across sections) ────────────────────────────
  const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas',
                       'Mia', 'Aiden', 'Charlotte', 'Jackson', 'Amelia', 'Logan', 'Harper', 'Sebastian', 'Evelyn', 'James',
                       'Luna', 'Benjamin', 'Scarlett', 'Elijah', 'Aria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
                      'Lee', 'Thompson', 'White', 'Harris', 'Clark'];
  const studentPwHash = await hash('Student@123456');
  const allSectionIds = Object.values(sectionMap).flat(); // 10 sections
  const studentIds = [];

  for (let i = 0; i < 25; i++) {
    const fn = firstNames[i];
    const ln = lastNames[i];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@student.demo.edu`;
    const admNo = `ADM${String(2025001 + i).padStart(7, '0')}`;
    const rollNo = String(i + 1).padStart(3, '0');
    const sectionId = allSectionIds[i % allSectionIds.length];

    let user = await p.user.findFirst({ where: { tenantId: TENANT_ID, email } });
    if (!user) {
      user = await p.user.create({
        data: {
          tenantId: TENANT_ID,
          email,
          passwordHash: studentPwHash,
          role: 'STUDENT',
          emailVerified: true,
          profile: {
            create: {
              firstName: fn,
              lastName: ln,
              dateOfBirth: new Date(2010 + (i % 6), i % 12, (i % 28) + 1),
              gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            },
          },
        },
      });
    }

    let student = await p.student.findFirst({ where: { userId: user.id } });
    if (!student) {
      student = await p.student.create({
        data: {
          tenantId: TENANT_ID,
          schoolId: SCHOOL_ID,
          userId: user.id,
          rollNumber: rollNo,
          admissionNo: admNo,
          admissionDate: new Date('2023-09-01'),
          bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
          isActive: true,
        },
      });
    }

    // Enroll student in section
    const enrolExists = await p.studentEnrollment.findFirst({
      where: { studentId: student.id, sectionId, academicYear: ACADEMIC_YEAR },
    });
    if (!enrolExists) {
      await p.studentEnrollment.create({
        data: {
          tenantId: TENANT_ID,
          studentId: student.id,
          sectionId,
          academicYear: ACADEMIC_YEAR,
          isActive: true,
        },
      });
    }
    studentIds.push({ id: student.id, sectionId });
  }
  console.log(`✅ Students ready: ${studentIds.length}`);

  // ── 8. Attendance (last 14 school days) ─────────────────────────────────
  const today = new Date();
  const attendanceDates = [];
  for (let d = 14; d >= 1; d--) {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    if (dt.getDay() !== 0 && dt.getDay() !== 6) attendanceDates.push(dt); // skip weekends
  }

  let attendanceCreated = 0;
  for (const { id: studentId, sectionId } of studentIds) {
    for (const date of attendanceDates) {
      const exists = await p.attendance.findFirst({ where: { studentId, sectionId, date } });
      if (!exists) {
        const rand = Math.random();
        const status = rand > 0.9 ? 'ABSENT' : rand > 0.85 ? 'LATE' : 'PRESENT';
        await p.attendance.create({
          data: {
            tenantId: TENANT_ID,
            studentId,
            sectionId,
            date,
            status,
            markedById: ADMIN_USER_ID,
            isBiometric: false,
          },
        });
        attendanceCreated++;
      }
    }
  }
  console.log(`✅ Attendance records created: ${attendanceCreated}`);

  // ── 9. Fee Structure ─────────────────────────────────────────────────────
  let feeStructure = await p.feeStructure.findFirst({ where: { tenantId: TENANT_ID, schoolId: SCHOOL_ID, academicYear: ACADEMIC_YEAR } });
  if (!feeStructure) {
    feeStructure = await p.feeStructure.create({
      data: {
        tenantId: TENANT_ID,
        schoolId: SCHOOL_ID,
        name: 'Standard Annual Fee 2025-2026',
        academicYear: ACADEMIC_YEAR,
        classIds: Object.values(classMap),
        components: [
          { name: 'Tuition Fee', amount: 800, isOptional: false, dueDay: 5 },
          { name: 'Lab Fee', amount: 100, isOptional: false, dueDay: 5 },
          { name: 'Library Fee', amount: 50, isOptional: false, dueDay: 5 },
          { name: 'Sports Fee', amount: 75, isOptional: true, dueDay: 5 },
        ],
        frequency: 'monthly',
        isActive: true,
      },
    });
    console.log('✅ Fee structure created');
  }

  // ── 10. Fee Invoices (3 months per student) ──────────────────────────────
  let invoiceCount = 0;
  for (const { id: studentId } of studentIds) {
    for (let m = 0; m < 3; m++) {
      const dueDate = new Date(2025, 9 + m, 5); // Oct, Nov, Dec 2025
      const invoiceNo = `INV-${studentId.substring(0, 4).toUpperCase()}-${String(m + 1).padStart(3, '0')}`;
      const existing = await p.feeInvoice.findFirst({ where: { studentId, feeStructureId: feeStructure.id, dueDate } });
      if (!existing) {
        const rand = Math.random();
        const status = m === 0 ? 'PAID' : m === 1 ? (rand > 0.5 ? 'PAID' : 'PARTIAL') : 'PENDING';
        const amount = 1025;
        const paid = status === 'PAID' ? 1025 : status === 'PARTIAL' ? 500 : 0;
        await p.feeInvoice.create({
          data: {
            tenantId: TENANT_ID,
            studentId,
            feeStructureId: feeStructure.id,
            invoiceNo,
            amount,
            discount: 0,
            fine: status === 'PENDING' ? 25 : 0,
            amountPaid: paid,
            status,
            dueDate,
            paidAt: status === 'PAID' ? dueDate : null,
          },
        });
        invoiceCount++;
      }
    }
  }
  console.log(`✅ Fee invoices created: ${invoiceCount}`);

  // ── 11. Subjects & Class-Subjects ────────────────────────────────────────
  const subjects = [
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Science', code: 'SCI' },
    { name: 'English', code: 'ENG' },
    { name: 'History', code: 'HIST' },
  ];
  const subjectIds = [];
  for (const sub of subjects) {
    let s = await p.subject.findFirst({ where: { tenantId: TENANT_ID, code: sub.code } });
    if (!s) {
      s = await p.subject.create({
        data: { tenantId: TENANT_ID, schoolId: SCHOOL_ID, name: sub.name, code: sub.code, description: sub.name + ' curriculum' },
      });
    }
    subjectIds.push(s.id);
  }

  const classSubjectIds = [];
  for (const [, classId] of Object.entries(classMap)) {
    for (let si = 0; si < subjectIds.length; si++) {
      let cs = await p.classSubject.findFirst({ where: { classId, subjectId: subjectIds[si] } });
      if (!cs) {
        cs = await p.classSubject.create({
          data: {
            tenantId: TENANT_ID,
            classId,
            subjectId: subjectIds[si],
            teacherId: teacherIds[si % teacherIds.length],
            weeklyHours: 5,
          },
        });
      }
      classSubjectIds.push({ csId: cs.id, teacherId: cs.teacherId });
    }
  }
  console.log(`✅ Subjects & class-subjects ready`);

  // ── 12. Grades (sample assessments) ─────────────────────────────────────
  let gradeCount = 0;
  for (const { id: studentId } of studentIds.slice(0, 10)) {
    for (const { csId: classSubjectId, teacherId } of classSubjectIds.slice(0, 4)) {
      const existing = await p.grade.findFirst({ where: { studentId, classSubjectId, academicYear: ACADEMIC_YEAR, term: 'TERM1', title: 'Mid-Term Exam' } });
      if (!existing) {
        const score = Math.floor(60 + Math.random() * 40);
        await p.grade.create({
          data: {
            tenantId: TENANT_ID,
            studentId,
            classSubjectId,
            teacherId,
            academicYear: ACADEMIC_YEAR,
            term: 'TERM1',
            assessmentType: 'MIDTERM',
            title: 'Mid-Term Exam',
            score,
            maxScore: 100,
            weight: 1.0,
            remarks: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs improvement',
          },
        });
        gradeCount++;
      }
    }
  }
  console.log(`✅ Grades created: ${gradeCount}`);

  // ── Final summary ─────────────────────────────────────────────────────────
  const [students, teachers, sections, invoices, attendance, grades] = await Promise.all([
    p.student.count({ where: { tenantId: TENANT_ID } }),
    p.teacher.count({ where: { tenantId: TENANT_ID } }),
    p.section.count({ where: { tenantId: TENANT_ID } }),
    p.feeInvoice.count({ where: { tenantId: TENANT_ID } }),
    p.attendance.count({ where: { tenantId: TENANT_ID } }),
    p.grade.count({ where: { tenantId: TENANT_ID } }),
  ]);
  console.log('\n📊 Database summary:');
  console.log(`   Students: ${students} | Teachers: ${teachers} | Sections: ${sections}`);
  console.log(`   Invoices: ${invoices} | Attendance: ${attendance} | Grades: ${grades}`);
  console.log('\n🎉 Demo seed complete!');
  console.log('\n🔑 Login credentials:');
  console.log('   Admin:   admin@demo.edu       / Admin@123456');
  console.log('   Teacher: sarah.j@demo.edu     / Teacher@123456');
  console.log('   Student: emma.smith@student.demo.edu / Student@123456');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
}).finally(() => p.$disconnect());
