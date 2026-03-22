import { type Page, type FrameLocator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PaymentPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isDisplayed(): Promise<boolean> {
    const heading = this.page.getByRole("heading", { name: "Reserve your appointment" });
    return heading.isVisible();
  }
  
  private getStripeFrame(): FrameLocator {
  // Target the card input iframe specifically — unique allow attribute
  return this.page
    .frameLocator('iframe[title="Secure payment input frame"][allow*="publickey-credentials-get"]');
}

  async enterCardDetails(opts: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    zip?: string;
    email?: string;
    phone?: string;
  }) {
    const stripe = this.getStripeFrame();
    await stripe.getByRole("textbox", { name: "Card number" }).fill(opts.cardNumber);
    await stripe.getByRole("textbox", { name: "Expiration date MM / YY" }).fill(opts.expiry);
    await stripe.getByRole("textbox", { name: "Security code" }).fill(opts.cvc);
    if (opts.zip) {
      await stripe.getByRole("textbox", { name: "ZIP code" }).fill(opts.zip);
    }
    if (opts.email) {
      await stripe.getByRole("textbox", { name: "Email" }).fill(opts.email);
    }
    if (opts.phone) {
      await stripe.getByRole("textbox", { name: "Mobile number" }).fill(opts.phone);
    }
  }

  async getOrderTotal(): Promise<string> {
    const totalElement = this.page.getByText(/\$\d+/).last();
    const text = await totalElement.textContent();
    return text?.trim() || "";
  }

  async getOrderScanType(): Promise<string> {
    const scanType = this.page.locator("text=/MRI Scan/i").first();
    return (await scanType.textContent())?.trim() || "";
  }

  async submitPayment() {
    await this.clickContinue();
    await this.page.waitForTimeout(10000);
  }

  async completePayment(opts: {
    cardNumber: string;
    expiry: string;
    cvc: string;
    zip?: string;
    email?: string;
    phone?: string;
  }) {
    await this.enterCardDetails(opts);
    await this.submitPayment();
  }
}