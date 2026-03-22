# Ezra Booking Flow — QA Automation

Playwright E2E test automation for the Ezra MRI/CT scan booking flow (Function Health QA Assessment).

## Architecture

```
ezra-qa-automation/
├── pages/                    # Page Object Model classes
│   ├── BasePage.ts           # Shared methods (navigation, waits, screenshots)
│   ├── SignUpPage.ts         # Member account creation
│   ├── PlanSelectionPage.ts  # Step 1: Scan type, DOB, sex selection
│   ├── ScheduleScanPage.ts   # Step 2: Location, date, time slot selection
│   ├── PaymentPage.ts        # Step 3: Stripe payment (Card/Bank/Affirm)
│   ├── ConfirmationPage.ts   # Post-booking confirmation
│   └── index.ts              # Barrel export
├── tests/
│   └── booking-flow.spec.ts  # 3 automated test cases
├── utils/
│   └── testData.ts           # Dynamic test data generation
├── playwright.config.ts      # Playwright configuration
├── .env.example              # Environment variable template
└── README.md
```

## Setup

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd ezra-qa-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Configure environment
cp .env.example .env
# Edit .env with your test credentials if needed
```

### Running Tests

```bash
# Run all tests (headless)
npm test

# Run tests in headed mode (see the browser)
npm run test:headed

# Run tests in debug mode (step through)
npm run test:debug

# Run with Playwright UI
npm run test:ui

# View HTML report after test run
npm run report
```

## Automated Test Cases

Three test cases were selected from the 15 defined in Question 1:

### TC-01: Successful End-to-End Booking (Happy Path)
**Why automated:** This is the #1 most critical test. It validates the entire revenue-generating flow — from account creation through scan selection, scheduling, payment, and confirmation. If this test fails, no member can complete a booking, which means zero revenue. It should run on every deployment in CI/CD.

### TC-02: Payment Rejected with Declined Card
**Why automated:** Declined card handling protects both business revenue and patient safety. If a declined payment creates a phantom appointment, a member may believe they have a confirmed scan that doesn't exist. Automating this ensures the error handling path is validated alongside the happy path on every release.

### TC-05: Price Consistency Through Entire Flow
**Why automated:** Price integrity spans three separate page components (plan selection → scheduling → payment summary). A pricing bug at any handoff point could result in overcharging (legal liability) or undercharging (revenue loss). This test catches cross-component pricing regressions that unit tests would miss.

## Design Decisions

### Dynamic vs. Hard-Coded Selectors
- **Location selection** uses text matching (`selectLocation("Aventura")`) rather than CSS indices (`nth-child(2)`) — resilient to UI reordering.
- **Date/time selection** picks the first available slot dynamically rather than hard-coding a specific date — avoids failures when staging data rolls past a fixed date.
- **Scan selection** matches by scan name text — won't break if card positions change.

### Environment-Driven Test Data
- Stripe test card numbers and credentials are in `.env`, not hard-coded in tests.
- Each test run generates a unique email via timestamp (`testuser+auto1710000000@gmail.com`) to avoid account collision across parallel runs.

### Stripe Iframe Handling
- Stripe embeds card input fields in an iframe. The `PaymentPage` attempts iframe interaction first with a fallback to direct page interaction, handling both rendering modes.

### Error Resilience
- Tests use `waitFor` and explicit visibility checks rather than fixed timeouts.
- Screenshots captured automatically on failure for debugging.
- Video recording retained on failure for reproduction.
- One automatic retry configured to handle transient staging environment flakiness.

## Scalability — Future Improvements

Given more time, I would implement:

1. **API-based account setup** — Create member accounts via API instead of UI to reduce test setup time and isolate booking flow tests from signup dependencies.
2. **Parallel execution** — Run tests in parallel with isolated accounts (currently sequential to avoid staging data conflicts).
3. **Visual regression testing** — Add screenshot comparison to catch unintended UI changes in the booking flow.
4. **CI/CD integration** — GitHub Actions workflow running tests on every PR with automated report publishing.
5. **Cross-browser coverage** — Extend to Firefox and WebKit (currently Chromium only for speed).
6. **Accessibility testing** — Integrate axe-core to validate WCAG compliance on each booking step.
7. **Performance budgets** — Measure and assert page load times for each booking step.
8. **Additional Stripe scenarios** — Automate 3D Secure authentication flows, Affirm financing, and bank payment methods.

## Trade-Offs

| Decision | Benefit | Cost |
|----------|---------|------|
| New account per test | Clean state, no data leakage | Slower execution (~30s signup overhead) |
| Dynamic date/time selection | Resilient to staging data changes | Less precise assertions on specific slots |
| Sequential execution | Avoids shared-state conflicts | Longer total suite time |
| Stripe iframe fallback | Handles rendering variations | Slightly more complex page object |
| Chromium-only | Faster CI runs | Missing Firefox/WebKit coverage |
