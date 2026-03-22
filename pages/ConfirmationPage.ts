import { type Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * ConfirmationPage - Displayed after successful booking.
 * Verifies booking confirmation details.
 */
export class ConfirmationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Verify the confirmation page is displayed */
  async isDisplayed(): Promise<boolean> {
    const confirmation = this.page.getByText(
      /requested time slots have been received/i
    );
    return confirmation.isVisible();
  }

  /** Get the confirmed scan type */
  async getConfirmedScanType(): Promise<string> {
    const scanType = this.page.getByText(/Scan Appointment|CT Scan/i).first();
    return (await scanType.textContent())?.trim() || "";
  }

  /** Get the confirmed location name */
  async getConfirmedLocation(): Promise<string> {
    const location = this.page.locator("text=/Location/i").locator("..");
    return (await location.textContent())?.trim() || "";
  }

  /** Check if the Medical Questionnaire button is present */
  async isMedicalQuestionnaireAvailable(): Promise<boolean> {
    return this.page
      .getByRole("button", { name: /begin medical questionnaire/i })
      .isVisible();
  }

  /** Click the Begin Medical Questionnaire button */
  async startMedicalQuestionnaire() {
    await this.page
      .getByRole("button", { name: /begin medical questionnaire/i })
      .click();
    await this.waitForPageLoad();
  }
}
