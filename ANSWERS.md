# Ezra / Function Health — Senior QA Engineer Take-Home Assessment

**Candidate:** Jonathan Bush
**Email:** jlloydbush@gmail.com
**Phone:** (630) 917-1808

---

## Question 1 — Part 1: 15 Test Cases (Ranked Most to Least Important)

**TC-01: Successful end-to-end booking with valid credit card payment**
A member completes signup, selects an MRI Scan, chooses a location, date, and time slot, enters valid Stripe test card details (4242424242424242), and lands on the scan confirmation page. Expected: booking confirmed, confirmation page displays correct scan type, location, and appointment datetime.

**TC-02: Payment rejected with declined credit card**
A member completes all booking steps but enters a declined Stripe test card (4000000000000002). Expected: payment fails, a clear error message is displayed, the member remains on the payment page and can retry without losing previously entered data.

**TC-03: Duplicate email registration is rejected**
A member attempts to register with an email address already associated with an existing account. Expected: the system displays an appropriate error and prevents account creation, directing the user to sign in instead.

**TC-04: Password strength enforcement on registration**
A member attempts to register with a weak password that does not meet requirements (e.g. fewer than 8 characters, no uppercase, no number or symbol). Expected: the submit button remains disabled or inline validation errors are shown for each unmet requirement, with clear guidance on how to fix them.

**TC-05: Correct scan price displayed consistently throughout entire flow**
A member selects a specific scan type (e.g. MRI Scan with Spine at $1,699) and proceeds through plan selection, scheduling, and payment pages. Expected: the selected scan price is consistent and accurate on every page of the flow with no discrepancy between what was selected and what is charged.

**TC-06: Sex-at-birth field is required on plan selection**
A member fills in date of birth and selects a scan but does not select sex at birth, then attempts to continue. Expected: the form cannot be submitted and a validation error is shown on the sex-at-birth field.

**TC-07: Date of birth field validates format and eligibility**
A member enters an invalid date of birth — including a future date, a non-existent date (e.g. 13-45-1990), or plain text. Expected: inline validation prevents progression with a clear, specific error message for each invalid input type.

**TC-08: Member cannot proceed past scheduling without selecting a time slot**
A member selects a location and date but does not click any time slot, then clicks Continue. Expected: the page does not advance and the member is prompted to select a time slot before proceeding.

**TC-09: Member cannot proceed past scheduling without selecting a date**
A member selects a location but does not click any date on the calendar, then clicks Continue. Expected: the page does not advance and the member is prompted to select a date before proceeding.

**TC-10: All three terms of service checkboxes must be accepted before registration**
A member fills out the registration form but only checks one or two of the three consent checkboxes. Expected: the Submit button remains disabled until all three are accepted, and no partial acceptance is allowed.

**TC-11: Expired credit card is rejected at payment**
A member enters a Stripe test card with a past expiration date. Expected: payment fails with an expiration-specific error message displayed inline in the card form, and the booking is not created.

**TC-12: Incomplete card number is rejected at payment**
A member enters a partial card number (e.g. only 8 digits) and attempts to submit the payment form. Expected: Stripe inline validation flags the card number field before submission and payment is not attempted.

**TC-13: Back navigation preserves previously entered data**
A member completes plan selection and reaches the scheduling page, then clicks Back. Expected: the plan selection page reloads with date of birth, sex at birth, and scan type still populated — the member does not have to re-enter their information.

**TC-14: All available scan options are displayed with correct names and prices**
A member reaches the plan selection page. Expected: MRI Scan ($999), MRI Scan with Spine ($1,699), and MRI Scan with Skeletal ($3,999) are all visible, correctly named, and show accurate prices matching the marketing site.

**TC-15: Registration form rejects invalid phone number format**
A member enters a phone number with fewer than 10 digits or non-numeric characters. Expected: inline validation flags the phone field and prevents form submission with a clear format error.

---

## Question 1 — Part 2: Top 3 Test Case Justifications

**TC-01: Successful end-to-end booking with valid credit card payment**
This is the most important test case because it validates the complete happy path that drives Ezra's core revenue. Every other test case is a variation or edge case of this flow. If this test fails in production, no member can complete a booking and the business impact is immediate and total. It also serves as the integration anchor — if this passes, every system involved (auth, plan selection, scheduling, Stripe, confirmation) is working together correctly.

**TC-02: Payment rejected with declined credit card**
Payment failure handling directly affects member trust and conversion. A member who encounters a declined card needs clear feedback and a frictionless path to retry — if the error is handled poorly or the state is lost, they abandon the booking entirely. This test also validates that failed payments do not create phantom bookings in the system, which would be both a data integrity issue and a compliance risk.

**TC-05: Correct scan price displayed consistently throughout entire flow**
Price inconsistency is simultaneously a legal risk, a trust risk, and a potential compliance violation. If the price shown at plan selection differs from what appears at checkout, members may dispute charges or lose confidence and drop off. This test catches any rendering or state management bug that causes the wrong price to propagate through the multi-step flow — a class of bug that is easy to introduce and hard to notice manually.

---

## Question 2 — Part 1: Integration Test Case — Unauthorized Access to Medical Data

### Test Case: Member Cannot Access Another Member's Medical Questionnaire

**Preconditions**
- Two member accounts exist: Member A and Member B, each with valid credentials
- Member A has completed booking and has an active medical questionnaire session
- Member B is authenticated with a separate valid session token

**Test Steps**
1. Authenticate as Member A and complete the booking flow to receive the Begin Medical Questionnaire URL (e.g. `https://myezra-staging.ezra.com/questionnaire/{memberA_id}`)
2. Authenticate as Member B using their own credentials to obtain a valid session token (tokenB)
3. While authenticated as Member B, directly navigate to Member A's questionnaire URL using Member B's session token
4. Observe the HTTP response code and body
5. Confirm Member A can still access their own questionnaire using their own token (tokenA)

**Expected Results**
- Step 3: Member B receives a 403 Forbidden response. Member A's questionnaire data is not returned or rendered.
- Member B is NOT silently redirected to their own questionnaire — the unauthorized access attempt must be explicitly rejected.
- Step 5: Member A receives a 200 OK with their own questionnaire data, confirming their access is unaffected.

---

## Question 2 — Part 2: HTTP Requests

**Step 1: Authenticate as Member A**
```
POST https://myezra-staging.ezra.com/api/auth/login
Content-Type: application/json

{ "email": "memberA@test.com", "password": "MemberAPass1!" }

→ Response: { "token": "tokenA", "memberId": "member_id_A" }
```

**Step 2: Authenticate as Member B**
```
POST https://myezra-staging.ezra.com/api/auth/login
Content-Type: application/json

{ "email": "memberB@test.com", "password": "MemberBPass1!" }

→ Response: { "token": "tokenB", "memberId": "member_id_B" }
```

**Step 3: Member B attempts to access Member A's questionnaire (should fail)**
```
GET https://myezra-staging.ezra.com/api/questionnaire/member_id_A
Authorization: Bearer tokenB
Accept: application/json

→ Expected: 403 Forbidden
{ "error": "Access denied" }
```

**Step 4: Confirm Member A can still access their own questionnaire**
```
GET https://myezra-staging.ezra.com/api/questionnaire/member_id_A
Authorization: Bearer tokenA
Accept: application/json

→ Expected: 200 OK with Member A's questionnaire data
```

---

## Question 2 — Part 3: Managing Security Quality at Scale (100+ Endpoints)

### Core Strategy: Automated Authorization Testing in CI

My approach centers on baking automated authorization testing directly into the CI pipeline, not relying on manual review or periodic security audits. The goal is to make it structurally impossible to ship a new sensitive endpoint without a corresponding authorization test.

### Implementation

The foundation is a role-permission matrix that maps every sensitive endpoint to the roles and resource ownership rules that should govern access. For each endpoint, parameterized tests cover four scenarios:

- Unauthenticated request — expect 401 Unauthorized
- Authenticated with wrong role — expect 403 Forbidden
- Authenticated with correct role but wrong resource ID (cross-member/cross-tenant attempt) — expect 403 Forbidden
- Authenticated with correct role and correct resource — expect 200 OK with correct data

For 100+ endpoint scale, the OpenAPI spec becomes the source of truth. A script parses the spec, identifies endpoints tagged as sensitive (PHI, PII, payment data), and auto-generates the authorization test skeleton for any new endpoint added to the spec. This closes the gap automatically — new endpoints cannot ship without a corresponding security test, because the CI step that generates and runs these tests will fail on any untagged sensitive endpoint.

### Tradeoffs

- **Maintenance overhead:** the role-permission matrix must stay current as roles evolve. I address this by treating it as a versioned artifact reviewed on any auth-related PR.
- **False confidence risk:** this approach only catches authorization failures — it does not catch data leakage within an authorized response (e.g. a 200 that returns fields belonging to a different member). Mitigating this requires a second layer of response schema validation tests.
- **Test environment dependency:** authorization tests require realistic test accounts and role configurations in the staging environment. Flaky auth state in staging can cause false failures, so test account management needs to be automated and isolated.

### Potential Risks

- If the OpenAPI spec is not kept in sync with actual implementation, the auto-generation misses endpoints entirely. Requires spec-first discipline or a runtime route discovery step as a backup.
- Authorization tests do not replace penetration testing — they catch known patterns but may miss novel attack vectors (e.g. mass assignment, IDOR via indirect references). I would complement this with quarterly pen testing for the highest-risk endpoints.
- Rate limiting and token rotation in staging can cause intermittent 401s that look like test failures. Requires careful handling of token refresh in the test harness.

The net result is a system where authorization coverage is continuous, measurable, and grows automatically with the codebase — rather than being a manual checklist that lags behind feature development.
