import { expect, Page } from '@playwright/test';

/**
 * Opens workspace project picker, filters by project name, and selects the tile.
 */
export async function selectWorkspaceProject(
  page: Page,
  projectTitle: string
): Promise<void> {
  await page.getByRole('menuitem', { name: /Projects/i }).click({ timeout: 60000 });
  await expect(page.locator('#projects')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: '' }).click({ timeout: 15000 });
  const projectNameInput = page.getByRole('textbox', { name: 'Project Name' });
  await expect(projectNameInput).toBeVisible({ timeout: 15000 });
  await projectNameInput.fill(projectTitle);
  await page.getByRole('button', { name: 'Apply' }).click({ timeout: 15000 });
  await page.waitForTimeout(800);

  const tile = page.locator('#projects').getByText(projectTitle, { exact: true }).first();
  await expect(tile).toBeVisible({ timeout: 60000 });
  await tile.click({ timeout: 60000 });

  if (await page.locator('#projects').isVisible()) {
    await page.keyboard.press('Escape');
  }
  await expect(page.locator('#projects')).toBeHidden({ timeout: 20000 });
}
