import type { Page } from "@playwright/test";
export async function choosePanel(page: Page, name: string) {
  const tab = page.getByRole("tab", { name, exact: true, includeHidden: true });
  await tab.waitFor({ state: "attached" });
  if (await tab.isVisible()) await tab.click();
}
