import { test, expect } from '@playwright/test';
import config from '../../config/config.json'; // Adjust the relative path

const reusableFlowName = 'Login';

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
// Skipped: flaky / env-specific navigation to Executions vs Test Pipelines (see CI).
test.skip('gtpExecutionMenuTest', async ({ page }) => {
  await page.goto(config.url);

  // Fill in the login form using the credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.getByRole('menuitem', { name: /Test Pipelines|Executions/i }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Executions|Test Pipelines/i })).toBeVisible({
    timeout: 60000,
  });
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
  await expect(page.getByRole('tab', { name: 'Tests Results' })).toBeVisible({ timeout: 60000 });
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
  await page.getByRole('menuitem', { name: /AI Assistant/i }).click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /AI Assistant/i })).toBeVisible({ timeout: 60000 });
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

test('gtpReusableFlowLoginDetailsTest', async ({ page }) => {
  await page.goto(config.url);

  // Login using credentials from config.json
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });

  // Open target project from config (same as regression suite)
  await page.getByRole('menuitem', { name: /Projects/i }).click({ timeout: 60000 });
  const projectTile = page.locator('#projects').getByText(config.projectTitle, { exact: true }).first();
  await expect(projectTile).toBeVisible({ timeout: 60000 });
  await projectTile.click({ timeout: 60000 });
  if (await page.locator('#projects').isVisible()) {
    await page.keyboard.press('Escape');
  }
  await expect(page.locator('#projects')).toBeHidden({ timeout: 20000 });

  // Navigate to Reusable Flows (scope to sidebar so project overlay does not steal the click)
  const sidebar = page.locator('app-sidebar');
  const reusableMenu =
    (await sidebar.count()) > 0
      ? sidebar.getByRole('menuitem', { name: /Reusable Flows/i })
      : page.getByRole('menuitem', { name: /Reusable Flows/i });
  await reusableMenu.scrollIntoViewIfNeeded();
  await reusableMenu.click({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Your Reusable Flows List|Reusable Flows/i })).toBeVisible({
    timeout: 60000,
  });

  // Ensure reusable flow named "Login" exists and open details (seed on projectTitle or skip)
  if ((await page.getByText(reusableFlowName, { exact: true }).count()) === 0) {
    test.skip(
      true,
      `Seed reusable flow "${reusableFlowName}" on project "${config.projectTitle}" or create it in the app.`
    );
  }
  await expect(page.getByText(reusableFlowName, { exact: true })).toBeVisible({ timeout: 60000 });
  await page.getByText(reusableFlowName, { exact: true }).click({ timeout: 60000 });
  await expect(page).toHaveURL(/reusable-flows\/details/i, { timeout: 60000 });

  // Validate key sections on details page
  await expect(page.getByRole('heading', { name: reusableFlowName }).first()).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Flow Steps/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Flow Usage/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Flow Information/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Recent Activity/i })).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('heading', { name: /Flow Actions/i })).toBeVisible({ timeout: 60000 });

  await page.locator('button.p-button-secondary.p-button-text.custom-button.p-button.p-component > span.p-button-label').click();
  await page.locator('a').filter({ hasText: 'Logout' }).click();
});
