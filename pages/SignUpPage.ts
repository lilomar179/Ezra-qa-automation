import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class SignUpPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate("/");
    await this.page.waitForTimeout(2000);
    await this.dismissCookieBanner();
    const joinLink = this.page.getByRole("link", { name: "Join" });
    try {
      await joinLink.waitFor({ state: "visible", timeout: 10000 });
      await joinLink.click();
      await this.page.waitForTimeout(2000);
    } catch {
      await this.page.goto(
        (process.env.BASE_URL || "https://myezra-staging.ezra.com") + "/join",
        { waitUntil: "domcontentloaded" }
      );
      await this.page.waitForTimeout(2000);
    }
  }

  async fillRegistrationForm(opts: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    await this.page.getByRole("textbox", { name: "Legal First Name" }).fill(opts.firstName);
    await this.page.getByRole("textbox", { name: "Legal Last Name" }).fill(opts.lastName);
    await this.page.getByRole("textbox", { name: "Email" }).fill(opts.email);
    await this.page.getByRole("textbox", { name: "Phone Number" }).fill(opts.phone);
    await this.page.getByRole("textbox", { name: "Password" }).fill(opts.password);
  }

  async acceptTerms() {
    // Click marketing + SMS first — these don't open a blocking modal
    await this.page.getByRole("button", { name: /I agree to receive marketing/i }).click();
    await this.page.waitForTimeout(500);
    await this.page.getByRole("button", { name: /I agree that Ezra, directly/i }).click();
    await this.page.waitForTimeout(500);
    // Click ToS last — this opens a modal
    await this.page.getByRole("button", { name: /I agree to Ezra's terms of/i }).click();
    await this.page.waitForTimeout(1000);
    // Close the modal if it opened
    const closeLink = this.page.getByRole("link", { name: "Close" });
    try {
      await closeLink.waitFor({ state: "visible", timeout: 5000 });
      await closeLink.click();
      await this.page.waitForTimeout(500);
    } catch {
      // Modal didn't open, that's fine
    }
  }

  async submitRegistration() {
    await this.page.getByRole("button", { name: "Submit" }).click();
    await this.page.waitForTimeout(5000);
  }

  async signUp(opts: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    await this.goto();
    await this.fillRegistrationForm(opts);
    await this.acceptTerms();
    await this.submitRegistration();
  }
}