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

**How to apply:** Always grep the schema before assuming field names or relations. Use `grep -A 20 "^model ModelName"` in prisma/schema.prisma.
