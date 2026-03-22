import { type Page, type Locator, expect } from "@playwright/test";
export class BasePage {
  readonly page: Page;
  constructor(page: Page) {
    this.page = page;
  }
  async navigate(path: string = "/") {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
    await this.dismissCookieBanner();
  }
  async waitForPageLoad() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForTimeout(2000);
  }
  async dismissCookieBanner() {
    try {
      const cookieBtn = this.page.getByRole("button", { name: "Accept" });
      await cookieBtn.waitFor({ state: "visible", timeout: 5000 });
      await cookieBtn.click();
      await this.page.waitForTimeout(500);
    } catch {
      // No cookie banner present
    }
  }
  async clickContinue() {
    const submitBtn = this.page.locator('[data-test="submit"]');
    await submitBtn.waitFor({ state: "visible", timeout: 15000 });
    await submitBtn.click({ force: true });
    await this.waitForPageLoad();
  }
  async clickBack() {
    const backBtn = this.page.getByRole("button", { name: "Back" });
    await backBtn.waitFor({ state: "visible" });
    await backBtn.click();
  }
  async getErrorMessages(): Promise<string[]> {
    const errors = this.page.locator('[class*="error"], [class*="Error"], [role="alert"], [class*="invalid"]');
    const count = await errors.count();
    const messages: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text?.trim()) messages.push(text.trim());
    }
    return messages;
  }
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}