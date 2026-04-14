import { test, expect, Page } from '@playwright/test';

const appUrl = process.env.GTP_URL ?? 'https://prod.gotestpro.com/';
const username = process.env.GTP_USERNAME ?? 'demotestmanager@rc.com';
const password = process.env.GTP_PASSWORD ?? 'admin';
const projectName = process.env.GTP_PROJECT ?? 'Amazon';

async function login(page: Page) {
  await page.goto(appUrl);
  await page.fill('input[name="email"]', username);
  await page.fill('input[name="password"]', password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await expect(page.getByRole('menuitem', { name: /Projects/i })).toBeVisible({ timeout: 60000 });
}

async function switchToProject(page: Page, targetProject: string) {
  await page.getByRole('menuitem', { name: /Projects/i }).click({ timeout: 60000 });
  await page.locator('#projects').getByText(targetProject, { exact: true }).first().click({ timeout: 60000 });
}

async function openReusableFlows(page: Page) {
  await page.getByRole('menuitem', { name: /Reusable Flows/i }).click({ timeout: 60000 });
  await expect(page).toHaveURL(/reusable-flows/i, { timeout: 60000 });
}

test.beforeEach(async ({ page }) => {
  await login(page);
  await switchToProject(page, projectName);
  await openReusableFlows(page);
});

test.afterEach(async ({ page }) => {
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});

test('gtpReusableFlowsNavigationAndListTest', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Your Reusable Flows List:' })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('columnheader', { name: /Flow Name/i })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /Description/i })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /Status/i })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /Actions/i })).toBeVisible();
});

test('gtpReusableFlowsSortDefaultTest', async ({ page }) => {
  await expect(page.getByText('Sort by:')).toBeVisible();
  await expect(page.getByText('Created Date (Newest)')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your Reusable Flows List:' })).toBeVisible();
});
