import { test, expect } from '@playwright/test';
import config from '../../config/config.json'; // Adjust the relative path

test('gtpLoginTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
 // await page.goto('https://app.gotestpro.com/#/login');
  //await page.getByPlaceholder('Email').click();
  //await page.getByPlaceholder('Email').fill('demotestmanager@rc.com');
  //await page.getByPlaceholder('Password').click();
  //await page.getByPlaceholder('Password').fill('manager');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await expect(page.getByRole('menuitem', { name: ' Projects' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  //await page.getByRole('button', { name: 'Demo Manager' }).click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('loginflowNegativeTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.getByPlaceholder('Password').fill('manager');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  //await expect(page.getByRole('menuitem', { name: ' Projects' })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('alert')).toContainText('Error MessageAuthentication Failed');
});
test('gtpProjectMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Projects' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpTestsMenutest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Tests' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Tests List', exact: true })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();

  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpTestPlanMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Test Plans' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Test Plans' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();

  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpExecutionMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Executions' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Execute' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpResultsMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Results' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'All Test Results' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});

test('gtpDashboardMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Dashboard' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpUsersMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Users' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Manage User' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpAIAssistantMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' AI Assistant (Beta)' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'AI Assistant (Beta)' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpProjectSettingsTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Project Settings' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpPageElementsTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: ' Page Elements' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Page Elements' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
test('gtpConfigurationTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
   await page.getByRole('menuitem', { name: 'Configuration' }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: 'Test Run Settings' })).toBeVisible({ timeout: 60000 });
  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
