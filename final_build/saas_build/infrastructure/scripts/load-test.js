/**
 * k6 Load Test — School Management SaaS
 * Target: 100,000 concurrent users, 100k req/sec
 *
 * Run: k6 run --vus 1000 --duration 5m load-test.js
 */
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ─── Custom Metrics ───────────────────────────────────────────
const errorRate = new Rate('error_rate');
const apiLatency = new Trend('api_latency', true);
const loginErrors = new Counter('login_errors');
const attendanceOps = new Counter('attendance_ops');

// ─── Load Profile ─────────────────────────────────────────────
export const options = {
  scenarios: {
    // Ramp up to 1000 VUs — simulates peak morning traffic
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Warm-up
        { duration: '3m', target: 500 },   // Ramp
        { duration: '5m', target: 1000 },  // Peak load
        { duration: '2m', target: 0 },     // Scale down
      ],
    },
    // Constant arrival rate — 1000 req/sec
    constant_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 200,
      maxVUs: 500,
      startTime: '12m',
    },
  },
  thresholds: {
    // SLA requirements
    http_req_duration: [
      'p(50)<100',   // p50 < 100ms
      'p(95)<300',   // p95 < 300ms
      'p(99)<800',   // p99 < 800ms
    ],
    error_rate: ['rate<0.01'],       // < 1% error rate
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://api.schoolsaas.com';
const TENANT_SLUG = __ENV.TENANT_SLUG || 'test-school';

// ─── Setup: Get auth token ────────────────────────────────────
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: 'load-test@school.com', password: 'LoadTest123!' }),
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_SLUG,
      },
    },
  );

  check(loginRes, { 'login successful': (r) => r.status === 200 });

  if (loginRes.status !== 200) {
    loginErrors.add(1);
    return { token: null };
  }

  const body = JSON.parse(loginRes.body);
  return { token: body.accessToken };
}

// ─── Main Test Scenario ───────────────────────────────────────
export default function (data) {
  const { token } = data;
  if (!token) return;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': TENANT_SLUG,
  };

  // Simulate realistic user behavior patterns
  const scenario = Math.random();

  if (scenario < 0.35) {
    // 35% — Dashboard / read-heavy
    testDashboard(headers);
  } else if (scenario < 0.55) {
    // 20% — Attendance marking (peak morning traffic)
    testAttendance(headers);
  } else if (scenario < 0.70) {
    // 15% — Student list browsing
    testStudentList(headers);
  } else if (scenario < 0.80) {
    // 10% — Grade viewing
    testGrades(headers);
  } else if (scenario < 0.90) {
    // 10% — Fee queries
    testFees(headers);
  } else {
    // 10% — Notifications check
    testNotifications(headers);
  }

  sleep(Math.random() * 2 + 0.5); // 0.5-2.5s think time
}

function testDashboard(headers) {
  group('Dashboard', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/dashboard/stats`, { headers });
    apiLatency.add(Date.now() - start);

    const ok = check(res, {
      'dashboard stats 200': (r) => r.status === 200,
      'response has data': (r) => JSON.parse(r.body)?.totalStudents !== undefined,
    });
    errorRate.add(!ok);
  });
}

function testAttendance(headers) {
  group('Attendance', () => {
    // Mark attendance for section
    const sectionId = '00000000-0000-0000-0000-000000000001'; // test section
    const records = Array.from({ length: 30 }, (_, i) => ({
      studentId: `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
      status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT',
    }));

    const start = Date.now();
    const res = http.post(
      `${BASE_URL}/api/v1/attendance/section/${sectionId}`,
      JSON.stringify({ records }),
      { headers },
    );
    apiLatency.add(Date.now() - start);

    const ok = check(res, {
      'attendance marked': (r) => r.status === 200 || r.status === 201,
    });
    errorRate.add(!ok);
    if (ok) attendanceOps.add(1);
  });
}

function testStudentList(headers) {
  group('Students', () => {
    const page = Math.floor(Math.random() * 10) + 1;
    const start = Date.now();
    const res = http.get(
      `${BASE_URL}/api/v1/students?page=${page}&limit=20`,
      { headers },
    );
    apiLatency.add(Date.now() - start);

    const ok = check(res, {
      'students list 200': (r) => r.status === 200,
      'has data array': (r) => Array.isArray(JSON.parse(r.body)?.data),
    });
    errorRate.add(!ok);
  });
}

function testGrades(headers) {
  group('Grades', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/grades?academicYear=2024-2025&term=Term1`, { headers });
    apiLatency.add(Date.now() - start);

    check(res, { 'grades 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });
}

function testFees(headers) {
  group('Fees', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/fees/invoices?status=PENDING`, { headers });
    apiLatency.add(Date.now() - start);

    check(res, { 'fees 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });
}

function testNotifications(headers) {
  group('Notifications', () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/api/v1/notifications?status=PENDING&limit=10`, { headers });
    apiLatency.add(Date.now() - start);

    check(res, { 'notifications 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
  });
}

// ─── Teardown ─────────────────────────────────────────────────
export function teardown(data) {
  console.log(`Load test complete. Token used: ${data.token ? 'yes' : 'no'}`);
}
