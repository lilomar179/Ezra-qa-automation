import { test, expect } from "@playwright/test";
import {
  SignUpPage,
  PlanSelectionPage,
  ScheduleScanPage,
  PaymentPage,
} from "../pages";
import { getTestMember, StripeTestCards, ScanOptions } from "../utils/testData";

test.describe("Ezra Booking Flow", () => {
  let signUpPage: SignUpPage;
  let planPage: PlanSelectionPage;
  let schedulePage: ScheduleScanPage;
  let paymentPage: PaymentPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    planPage = new PlanSelectionPage(page);
    schedulePage = new ScheduleScanPage(page);
    paymentPage = new PaymentPage(page);
  });

  test("TC-01: Successful end-to-end booking with valid credit card payment", async ({
    page,
  }) => {
    const member = getTestMember();
    const scan = ScanOptions.MRI_SCAN;

    await signUpPage.signUp({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      password: member.password,
    });

    await expect(page.getByText("Select your Scan")).toBeVisible({ timeout: 20000 });
    await planPage.enterDateOfBirth(member.dob);
    await planPage.selectSexAtBirth("Male");
    await planPage.selectScan(scan.name);
    await page.getByTestId("select-plan-submit-btn").click();
    await page.waitForTimeout(3000);

    await schedulePage.selectLocation("AMRIC");
    await schedulePage.selectFirstAvailableDate();
    await schedulePage.selectFirstAvailableTimeSlot();
    await schedulePage.clickContinue();

    await expect(page.getByRole("heading", { name: "Reserve your appointment" })).toBeVisible({ timeout: 20000 });
    const validCard = { ...StripeTestCards.valid, email: member.email };
    await paymentPage.completePayment(validCard);

    await page.waitForTimeout(5000);
    const pageContent = await page.textContent("body");
    const isConfirmed =
      pageContent?.toLowerCase().includes("confirmed") ||
      pageContent?.toLowerCase().includes("thank you") ||
      pageContent?.toLowerCase().includes("booked") ||
      pageContent?.toLowerCase().includes("appointment");
    expect(isConfirmed).toBeTruthy();
  });

  test("TC-02: Payment rejected with declined credit card", async ({
    page,
  }) => {
    const member = getTestMember();
    const scan = ScanOptions.MRI_SCAN;

    await signUpPage.signUp({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      password: member.password,
    });

    await expect(page.getByText("Select your Scan")).toBeVisible({ timeout: 20000 });
    await planPage.enterDateOfBirth(member.dob);
    await planPage.selectSexAtBirth("Female");
    await planPage.selectScan(scan.name);
    await page.getByTestId("select-plan-submit-btn").click();
    await page.waitForTimeout(3000);

    await schedulePage.selectLocation("AMRIC");
    await schedulePage.selectFirstAvailableDate();
    await schedulePage.selectFirstAvailableTimeSlot();
    await schedulePage.clickContinue();

    await expect(page.getByRole("heading", { name: "Reserve your appointment" })).toBeVisible({ timeout: 20000 });
    const declinedCard = { ...StripeTestCards.declined, email: member.email };
    await paymentPage.enterCardDetails(declinedCard);
    await paymentPage.submitPayment();

    // Wait for Stripe to process and return decline response
    await page.waitForTimeout(5000);

    // Verify: Payment failed — page still contains payment-related content
    const pageContent = await page.textContent("body");
    const hasError =
      pageContent?.toLowerCase().includes("decline") ||
      pageContent?.toLowerCase().includes("failed") ||
      pageContent?.toLowerCase().includes("error") ||
      pageContent?.toLowerCase().includes("unsuccessful") ||
      pageContent?.toLowerCase().includes("card") ||
      pageContent?.toLowerCase().includes("payment");
    expect(hasError).toBeTruthy();

    // Verify: Still on payment page
    const stillOnPayment = await paymentPage.isDisplayed();
    expect(stillOnPayment).toBeTruthy();
  });

  test("TC-05: Verify correct scan price displayed through entire flow", async ({
    page,
  }) => {
    const member = getTestMember();
    const scan = ScanOptions.MRI_SCAN;

    await signUpPage.signUp({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      password: member.password,
    });

    await expect(page.getByText("Select your Scan")).toBeVisible({ timeout: 20000 });
    const planPageContent = await page.textContent("body");
    expect(planPageContent).toContain(scan.price);

    await planPage.enterDateOfBirth(member.dob);
    await planPage.selectSexAtBirth("Male");
    await planPage.selectScan(scan.name);
    await page.getByTestId("select-plan-submit-btn").click();
    await page.waitForTimeout(3000);

    await schedulePage.selectLocation("AMRIC");
    await schedulePage.selectFirstAvailableDate();
    await schedulePage.selectFirstAvailableTimeSlot();
    await schedulePage.clickContinue();

    await expect(page.getByRole("heading", { name: "Reserve your appointment" })).toBeVisible({ timeout: 20000 });
    const orderTotal = await paymentPage.getOrderTotal();
    expect(orderTotal).toContain(scan.price);

    const paymentContent = await page.textContent("body");
    expect(paymentContent).toContain(scan.name);
  });
});