---
name: MySchool Prisma Schema Quirks
description: Non-obvious field names and missing relations in the Prisma schema that differ from convention.
---

# Schema Quirks

**Announcement model:**
- Field is `body` (not `content`)
- Author field is `createdById` (not `authorId`) — it's just a String UUID, no relation defined
- No `author` relation in the schema

**BookIssue model:**
- No `user` relation — only `userId: String @db.Uuid`
- Cannot do `include: { user: ... }` in Prisma queries

**Section model:**
- `students` relation is `StudentEnrollment[]` (join table), not direct Student[]
- `_count: { select: { students: true } }` counts StudentEnrollment rows

**SchoolEvent model (if exists):**
- Check schema before assuming field names

**DateTime fields:** Prisma rejects date-only strings like `"2025-01-15"` for `DateTime` fields — must wrap with `new Date(dto.dateField)` in the service. Affects `admissionDate` on Student, `joiningDate` on Teacher.

**schoolId resolution:** Student, Teacher (and Exam) services require `schoolId` but the controller passes `undefined` (from `req.query.schoolId`). Each service must resolve schoolId via `prisma.school.findFirst({ where: { tenantId } })` if not provided.

**FeeInvoice requires feeStructureId (NOT NULL):** Cannot create a direct invoice without creating a fee structure row first. The `createDirectInvoice` method auto-creates a one-time inactive fee structure then links the invoice to it.

**How to apply:** Always grep the schema before assuming field names or relations. Use `grep -A 20 "^model ModelName"` in prisma/schema.prisma. Wrap any DateTime create fields in `new Date()` in services.
