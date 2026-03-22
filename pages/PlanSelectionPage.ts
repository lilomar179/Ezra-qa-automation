import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";
export class PlanSelectionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }
  async isDisplayed(): Promise<boolean> {
    const heading = this.page.getByText("Select your Scan");
    return heading.isVisible();
  }
  async enterDateOfBirth(dob: string) {
    const dobField = this.page.getByRole("textbox", { name: "Date of birth (MM-DD-YYYY)" });
    await dobField.waitFor({ state: "visible", timeout: 15000 });
    await dobField.click();
    await dobField.fill(dob);
  }
  async selectSexAtBirth(value: string) {
    await this.page.locator(".multiselect__tags").click();
    await this.page.waitForTimeout(500);
    await this.page.locator("span").filter({ hasText: value }).first().click();
  }
  async selectScan(scanName: string) {
    await this.page.getByText(scanName + " Available at $").click();
  }
  async getScanPrice(scanName: string): Promise<string> {
    const scanCard = this.page.locator("div").filter({ hasText: scanName }).first();
    const priceText = await scanCard.getByText(/Available at \$/).textContent();
    return priceText?.replace("Available at ", "").trim() || "";
  }
  async completePlanSelection(opts: { dob: string; sex: string; scanName: string }) {
    await this.enterDateOfBirth(opts.dob);
    await this.selectSexAtBirth(opts.sex);
    await this.selectScan(opts.scanName);
    await this.page.getByTestId("select-plan-submit-btn").click();
    await this.waitForPageLoad();
  }
}