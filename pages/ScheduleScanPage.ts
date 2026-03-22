import { type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ScheduleScanPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isDisplayed(): Promise<boolean> {
    const heading = this.page.getByText("Schedule your scan");
    return heading.isVisible();
  }

  async selectLocation(locationName?: string) {
    const card = locationName
      ? this.page.locator("div, li, [role]").filter({ hasText: locationName }).first()
      : this.page.locator("div, li, [role]").filter({ hasText: /AMRIC/ }).first();

    await card.waitFor({ state: "visible", timeout: 45000 });
    await card.click();

    // Wait for calendar to render after selection
    await this.page
      .locator("[data-testid*='cal-day-content']")
      .first()
      .waitFor({ state: "attached", timeout: 30000 });
    await this.page.waitForTimeout(1000);
  }

  async selectFirstAvailableDate() {
    await this.page.waitForTimeout(2000);

    const allDates = this.page.locator("[data-testid*='cal-day-content']");
    await allDates.first().waitFor({ state: "attached", timeout: 15000 });
    await allDates.first().scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);

    const count = await allDates.count();
    for (let i = 0; i < count; i++) {
      const date = allDates.nth(i);
      if (!(await date.isVisible())) continue;

      await date.scrollIntoViewIfNeeded();
      await date.click({ force: true });
      await this.page.waitForTimeout(2000);

      // Check if time slots appeared after clicking this date
      const timeSlots = this.page.getByText(/:\d{2}\s*(AM|PM)/i);
      const slotCount = await timeSlots.count();
      if (slotCount > 0) {
        return; // This date has slots — done
      }
      // No slots for this date — try the next one
    }

    throw new Error("No date with available time slots found in calendar");
  }

  async selectFirstAvailableTimeSlot() {
    const timeSlot = this.page.getByText(/:\d{2}\s*(AM|PM)/i).first();
    await timeSlot.waitFor({ state: "visible", timeout: 20000 });
    await timeSlot.click();
    await this.page.waitForTimeout(500);
  }

  async completeScheduling(opts?: { locationName?: string }) {
    await this.selectLocation(opts?.locationName);
    await this.selectFirstAvailableDate();
    await this.selectFirstAvailableTimeSlot();
    await this.clickContinue();
  }
}