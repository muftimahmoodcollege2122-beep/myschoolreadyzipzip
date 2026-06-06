---
name: MySchool PII Scrubber Bug
description: The PiiScrubberInterceptor was globally replacing accessToken and refreshToken with [REDACTED] in every API response, breaking login.
---

# PII Scrubber Interceptor — Token Redaction Bug

## The Rule
`accessToken` and `refreshToken` must NOT be in `PII_FIELDS` in `PiiScrubberInterceptor`.

**File**: `apps/api/src/common/interceptors/correlation-id.interceptor.ts`

## Why
The `PiiScrubberInterceptor` is a global NestJS interceptor that mutates response objects before they are sent. It originally included `'accessToken'` and `'refreshToken'` in `PII_FIELDS`, which caused every login/refresh response to have tokens replaced with the literal string `[REDACTED]`. The browser received `[REDACTED]` as the token, stored it in localStorage, and every authenticated API call returned 401.

## How to Apply
When debugging 401 errors on every authenticated request after a successful login, check this interceptor first. Tokens are not PII — they are opaque credentials. Only true PII (passwords, national IDs, medical data, financial data) should be scrubbed.

## Auth Guard Pattern (also fixed)
- Auth guard must use `useState('loading')` initial state (not `useState(() => readFromStorage())`) to avoid React hydration mismatches between server and client renders.
- Auth guard reads localStorage in `useEffect` only (client-only).
- Login page must write to localStorage synchronously before `window.location.href` navigation.
- api-client must NOT do `window.location.href = '/login'` on 401 — only the auth guard should own redirects.
