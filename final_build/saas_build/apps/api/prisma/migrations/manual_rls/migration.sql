-- Row-Level Security: real, database-enforced tenant isolation.
-- Even if application code forgets a `where: { tenantId }` clause,
-- Postgres itself will refuse to return/modify another tenant's rows.
--
-- REQUIRES: the app to set `app.current_tenant_id` per request/transaction
-- (see PrismaService.scopedClient + TenantContextMiddleware).
--
-- !! TEST ON A NEON BRANCH FIRST. If the session variable isn't set for
-- ANY code path that reads/writes these tables, that path will see ZERO
-- rows / have all writes rejected. Do not run this against production
-- until you've verified every route your app actually uses.

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "subscriptions";
CREATE POLICY tenant_isolation ON "subscriptions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "usage_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "usage_records";
CREATE POLICY tenant_isolation ON "usage_records"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "schools" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "schools" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "schools";
CREATE POLICY tenant_isolation ON "schools"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "users";
CREATE POLICY tenant_isolation ON "users"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "departments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "departments";
CREATE POLICY tenant_isolation ON "departments"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "classes";
CREATE POLICY tenant_isolation ON "classes"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "sections" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sections" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "sections";
CREATE POLICY tenant_isolation ON "sections"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "students";
CREATE POLICY tenant_isolation ON "students"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_enrollments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_enrollments";
CREATE POLICY tenant_isolation ON "student_enrollments"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "parents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "parents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "parents";
CREATE POLICY tenant_isolation ON "parents"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_parents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_parents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_parents";
CREATE POLICY tenant_isolation ON "student_parents"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teachers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "teachers";
CREATE POLICY tenant_isolation ON "teachers"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "staff" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "staff" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "staff";
CREATE POLICY tenant_isolation ON "staff"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_requests" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "leave_requests";
CREATE POLICY tenant_isolation ON "leave_requests"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "performance_reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "performance_reviews" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "performance_reviews";
CREATE POLICY tenant_isolation ON "performance_reviews"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subjects" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "subjects";
CREATE POLICY tenant_isolation ON "subjects"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "class_subjects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "class_subjects" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "class_subjects";
CREATE POLICY tenant_isolation ON "class_subjects"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "academic_calendars" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academic_calendars" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "academic_calendars";
CREATE POLICY tenant_isolation ON "academic_calendars"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "timetable_slots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "timetable_slots" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "timetable_slots";
CREATE POLICY tenant_isolation ON "timetable_slots"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendances" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "attendances";
CREATE POLICY tenant_isolation ON "attendances"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "teacher_attendances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_attendances" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "teacher_attendances";
CREATE POLICY tenant_isolation ON "teacher_attendances"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "grading_scales" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grading_scales" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "grading_scales";
CREATE POLICY tenant_isolation ON "grading_scales"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "grades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "grades" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "grades";
CREATE POLICY tenant_isolation ON "grades"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exams" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exams" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exams";
CREATE POLICY tenant_isolation ON "exams"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exam_results" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_results" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exam_results";
CREATE POLICY tenant_isolation ON "exam_results"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "fee_structures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_structures" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "fee_structures";
CREATE POLICY tenant_isolation ON "fee_structures"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "fee_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_invoices" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "fee_invoices";
CREATE POLICY tenant_isolation ON "fee_invoices"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "payments";
CREATE POLICY tenant_isolation ON "payments"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "messages";
CREATE POLICY tenant_isolation ON "messages"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "announcements" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "announcements";
CREATE POLICY tenant_isolation ON "announcements"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "notifications";
CREATE POLICY tenant_isolation ON "notifications"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "library_books" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "library_books" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "library_books";
CREATE POLICY tenant_isolation ON "library_books"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "book_issues" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "book_issues" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "book_issues";
CREATE POLICY tenant_isolation ON "book_issues"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "transport_routes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transport_routes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "transport_routes";
CREATE POLICY tenant_isolation ON "transport_routes"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "hostels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hostels" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "hostels";
CREATE POLICY tenant_isolation ON "hostels"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "school_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school_events" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "school_events";
CREATE POLICY tenant_isolation ON "school_events"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "inventory_items";
CREATE POLICY tenant_isolation ON "inventory_items"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_documents" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_documents";
CREATE POLICY tenant_isolation ON "student_documents"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "audit_logs";
CREATE POLICY tenant_isolation ON "audit_logs"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "consent_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consent_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "consent_records";
CREATE POLICY tenant_isolation ON "consent_records"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "outbox_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "outbox_events" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "outbox_events";
CREATE POLICY tenant_isolation ON "outbox_events"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "question_banks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "question_banks" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "question_banks";
CREATE POLICY tenant_isolation ON "question_banks"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "questions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "questions";
CREATE POLICY tenant_isolation ON "questions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "online_exam_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "online_exam_sessions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "online_exam_sessions";
CREATE POLICY tenant_isolation ON "online_exam_sessions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "online_exam_answers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "online_exam_answers" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "online_exam_answers";
CREATE POLICY tenant_isolation ON "online_exam_answers"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "fee_discounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_discounts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "fee_discounts";
CREATE POLICY tenant_isolation ON "fee_discounts"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "scholarships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scholarships" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "scholarships";
CREATE POLICY tenant_isolation ON "scholarships"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "scholarship_grants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "scholarship_grants" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "scholarship_grants";
CREATE POLICY tenant_isolation ON "scholarship_grants"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "fee_installment_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_installment_plans" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "fee_installment_plans";
CREATE POLICY tenant_isolation ON "fee_installment_plans"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "fee_installments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fee_installments" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "fee_installments";
CREATE POLICY tenant_isolation ON "fee_installments"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "expenses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "expenses";
CREATE POLICY tenant_isolation ON "expenses"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "budgets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "budgets" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "budgets";
CREATE POLICY tenant_isolation ON "budgets"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "cashbook_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cashbook_entries" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "cashbook_entries";
CREATE POLICY tenant_isolation ON "cashbook_entries"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_behaviors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_behaviors" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_behaviors";
CREATE POLICY tenant_isolation ON "student_behaviors"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_medical_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_medical_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_medical_records";
CREATE POLICY tenant_isolation ON "student_medical_records"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_achievements" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_achievements";
CREATE POLICY tenant_isolation ON "student_achievements"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "student_warnings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_warnings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "student_warnings";
CREATE POLICY tenant_isolation ON "student_warnings"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "lesson_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lesson_plans" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "lesson_plans";
CREATE POLICY tenant_isolation ON "lesson_plans"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "teacher_substitutions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_substitutions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "teacher_substitutions";
CREATE POLICY tenant_isolation ON "teacher_substitutions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "training_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "training_records" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "training_records";
CREATE POLICY tenant_isolation ON "training_records"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "teacher_certifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "teacher_certifications" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "teacher_certifications";
CREATE POLICY tenant_isolation ON "teacher_certifications"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "qr_attendance_codes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "qr_attendance_codes" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "qr_attendance_codes";
CREATE POLICY tenant_isolation ON "qr_attendance_codes"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "qr_attendance_scans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "qr_attendance_scans" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "qr_attendance_scans";
CREATE POLICY tenant_isolation ON "qr_attendance_scans"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "attendance_approvals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "attendance_approvals" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "attendance_approvals";
CREATE POLICY tenant_isolation ON "attendance_approvals"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exam_halls" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_halls" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exam_halls";
CREATE POLICY tenant_isolation ON "exam_halls"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exam_seatings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_seatings" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exam_seatings";
CREATE POLICY tenant_isolation ON "exam_seatings"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exam_moderations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_moderations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exam_moderations";
CREATE POLICY tenant_isolation ON "exam_moderations"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "exam_revaluations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exam_revaluations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "exam_revaluations";
CREATE POLICY tenant_isolation ON "exam_revaluations"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "merit_list_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "merit_list_entries" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "merit_list_entries";
CREATE POLICY tenant_isolation ON "merit_list_entries"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "blog_posts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "blog_posts" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "blog_posts";
CREATE POLICY tenant_isolation ON "blog_posts"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "gallery_albums" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery_albums" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "gallery_albums";
CREATE POLICY tenant_isolation ON "gallery_albums"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "gallery_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery_items" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "gallery_items";
CREATE POLICY tenant_isolation ON "gallery_items"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "support_tickets" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "support_tickets";
CREATE POLICY tenant_isolation ON "support_tickets"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "ticket_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ticket_responses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ticket_responses";
CREATE POLICY tenant_isolation ON "ticket_responses"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "coupon_usages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupon_usages" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "coupon_usages";
CREATE POLICY tenant_isolation ON "coupon_usages"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "school_policies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "school_policies" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "school_policies";
CREATE POLICY tenant_isolation ON "school_policies"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "setup_checklists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "setup_checklists" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "setup_checklists";
CREATE POLICY tenant_isolation ON "setup_checklists"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "academic_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "academic_rules" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "academic_rules";
CREATE POLICY tenant_isolation ON "academic_rules"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "custom_forms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "custom_forms" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "custom_forms";
CREATE POLICY tenant_isolation ON "custom_forms"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "form_responses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "form_responses" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "form_responses";
CREATE POLICY tenant_isolation ON "form_responses"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "alumni" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "alumni" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "alumni";
CREATE POLICY tenant_isolation ON "alumni"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "ip_restrictions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ip_restrictions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "ip_restrictions";
CREATE POLICY tenant_isolation ON "ip_restrictions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "login_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "login_history" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "login_history";
CREATE POLICY tenant_isolation ON "login_history"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "suspicious_activities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suspicious_activities" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "suspicious_activities";
CREATE POLICY tenant_isolation ON "suspicious_activities"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "notification_preferences";
CREATE POLICY tenant_isolation ON "notification_preferences"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "inventory_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_transactions" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "inventory_transactions";
CREATE POLICY tenant_isolation ON "inventory_transactions"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "hostel_rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hostel_rooms" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "hostel_rooms";
CREATE POLICY tenant_isolation ON "hostel_rooms"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));

ALTER TABLE "hostel_allocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "hostel_allocations" FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_isolation ON "hostel_allocations";
CREATE POLICY tenant_isolation ON "hostel_allocations"
  USING ("tenantId"::text = current_setting('app.current_tenant_id', true));
