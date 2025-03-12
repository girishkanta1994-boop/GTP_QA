import { test, expect } from '@playwright/test';
import config from '../../config/config.json';

// Reusable function for login
async function login(page) {
  await page.goto(config.url);
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForSelector('app-sidebar', { state: 'visible' });
}

// Reusable function to navigate via the sidebar
async function navigateTo(page, menuItem) {
  await page.getByRole('menuitem', { name: menuItem }).click();
}

// Test for Project Creation
test('gtpProjectCreationTest', async ({ page }) => {
  await login(page);
  await navigateTo(page, 'Projects');

  await page.getByRole('button', { name: 'Add New Project' }).click();
  await page.getByPlaceholder('Project Title').fill(config.projectTitle);
  console.log(`Project Title: ${config.projectTitle}`);

  await page.getByRole('button', { name: '' }).click();
  await page.getByRole('button', { name: '' }).click();
  await page.getByLabel('Browser Test').click();
  await page.getByPlaceholder('Project Description').fill('To Test Demo Project');

  await page.getByRole('button', { name: 'Add Environment' }).click();
  await page.getByText('Please select environment').click();
  await page.getByLabel('Production').click();
  await page.getByPlaceholder('https://gotestpro.com').fill('https://saucedemo.com');

  await page.getByLabel('Add Environment').getByRole('button', { name: 'Save' }).click();
  const parent = page.locator('xpath=/html/body/app-root/div/div[2]/app-projects/div/p-card/div/div/div/div/div[6]/button/span');
  await parent.waitFor({ state: 'visible' });
  await parent.click();
  await page.waitForTimeout(5000);
  // Validate project creation
  await expect(page.locator('app-header')).toContainText(config.projectTitle);
});

// Test for Test Case Creation
test('gtpTestsCreationTest', async ({ page }) => {
  await login(page);
  await navigateTo(page, 'Tests');

  await page.getByRole('button', { name: 'Add New Test' }).click();
  await expect(page.locator('#pr_id_8-label')).toContainText('Test Name');

  await page.getByRole('textbox', { name: 'Test Name' }).fill('verify_checkout');
  await page.getByPlaceholder('Description').fill('To Verify Checkout Functionality');
  await page.waitForTimeout(5000);
  await page.getByRole('combobox').getByRole('textbox').fill('smoke_ver_01');
  await page.getByText('Smoke_ver_01').click();
  await page.getByPlaceholder('Description').fill('To Verify Checkout Functionality');

  await page.getByRole('button', { name: 'Create Test' }).click();

  // Validate test creation
  await expect(page.getByRole('heading', { name: 'verify_checkout' })).toBeVisible();
});

// Test for Test Plan Creation
test('gtpTestPlanCreationTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');

  await page.getByRole('button', { name: 'Add Test Plan' }).click();
  await page.getByPlaceholder('Sprint1').fill('sprint_01_release');

  await page.locator('textarea').fill('Sprint release testing');

  await page.getByRole('button', { name: 'Add Tests' }).click();
  await page.waitForTimeout(5000); // Waits for 5 seconds
  
  await expect(page.getByRole('option')).toContainText('verify_checkout');
  
  await page.locator('p-picklist').getByRole('button').nth(1).click();
  await page.getByLabel('Add Test').getByRole('button', { name: 'Save' }).click();
 
  await page.getByRole('button', { name: 'Add Environment' }).click();
  await page.getByRole('button', { name: 'Icon Add New Environment' }).click();
  await page.waitForTimeout(5000);
  await page.getByLabel('Add New Environment').getByRole('button', { name: '' }).click();
  
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  const grid = page.getByRole('grid').filter({
    hasText: 'sprint_01_release'
  });
  await expect(grid).toBeVisible();
  await expect(grid).toContainText('sprint_01_release');
  
});

// Test for Test Execution
test('gtpTestsExecutionTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByText('sprint_01_release').click();
  await page.getByRole('button', { name: 'Execute' }).click();

  await expect(page.getByLabel('Inprogress (1)').locator('p-table'))
  .toContainText('sprint_01_release', { timeout: 30000 }); // 10 seconds timeout
 // await page.waitForSelector('p-table', { state: 'visible' });
  //await expect(page.locator('p-table')).toContainText('sprint_01_release');
});

// Test for Configuration
test('gtpConfigurationTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Configuration');

  await page.getByRole('button', { name: 'Icon Add New Environment' }).click();
  await page.getByRole('tab', { name: 'Desktop' }).click();
  await page.getByLabel('Desktop').getByText('OS', { exact: true }).click();
  await page.locator('.p-dropdown-filter').click();
  await page.locator('.p-dropdown-filter').fill('windows 11');
  await page.getByLabel('Windows').locator('div').first().click();
  await page.getByRole('button', { name: 'Save Environment' }).click();
  await expect(page.locator('tbody')).toContainText('Windows 11');
});



test('gtpAPITest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Tests');

  await page.getByRole('tab', { name: 'API Tests' }).click();
  await page.getByRole('button', { name: 'Add New Test' }).click();

  // Fill Test Name
  const testName = 'check_post';
  await page.getByRole('textbox', { name: 'Test Name' }).fill(testName);

  await page.locator('div').filter({ hasText: /^Add Tags$/ }).nth(2).click();
  await page.getByRole('combobox').getByRole('textbox').fill('post_req');
  await page.waitForTimeout(1000);
  const tagElement = await page.getByText('post_req');
  await expect(tagElement).toBeVisible();
  await tagElement.click();

  await page.getByRole('button', { name: 'Create Test' }).click();
  await page.waitForTimeout(1000);
  const apiHeading = await page.getByRole('heading', { name: testName }).textContent();
  console.log('API Heading:', apiHeading);
  expect(apiHeading?.trim()).toBe(testName);

  // Fill API Test Scenario
  await page.getByRole('button', { name: 'Create API Test' }).click();
  await page.getByPlaceholder('Scenario Name').fill('check_post_req');
  await page.waitForTimeout(5000);
  await page.locator('div').filter({ hasText: /^Request MethodGET$/ }).first().click();
  await page.getByLabel('POST').waitFor({ state: 'visible' });
await page.getByLabel('POST').click();

  await page.getByPlaceholder('API Endpoint').fill('https://reqres.in/api/users');
  
  await page.locator('div').filter({ hasText: /^JSON$/ }).locator('div').nth(2).click();

  const jsonPayload = `{
    "name": "morpheus",
    "job": "leader"
  }`;
 const jsonInput=  await page.getByPlaceholder('Enter JSON').fill(jsonPayload);

  // Add a wait to ensure content gets updated
  await page.waitForTimeout(1000);

  

  // Send API Request and Verify Response
  await page.getByRole('button', { name: 'Send Request' }).click();
  await expect(page.getByText('201 CREATED')).toBeVisible();

  // Save the API Test
  await page.getByRole('button', { name: 'Save' }).click();
  // Best approach: Use getByLabel to disambiguate
const jsonInput1 = page.getByLabel('check_post_req').getByPlaceholder('Enter JSON');

await expect(jsonInput1).toHaveValue('{\n    "name": "morpheus",\n    "job": "leader"\n  }', { timeout: 15000 });


  // Verify Tree Structure
  const treeStructure = page.getByLabel('check_post_req').getByText('Tree ▾Select a node...object{');

  await expect(treeStructure).toBeVisible();
  
});

test('gtpDeleteAPITest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Tests');

  await page.getByRole('tab', { name: 'API Tests' }).click();
  await page.getByRole('img').nth(4).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});



test('gtpProectSettingsTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Project Settings');
  await page.waitForTimeout(10000);

  await expect(page.getByRole('tab', { name: 'Variables' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Integrations' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Applitools Integration' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Chrome Extension Setup' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Open AI Setup' })).toBeVisible();
await expect(page.getByRole('tab', { name: 'Credentials' })).toBeVisible();

  await page.getByPlaceholder('Name').click();
  await page.getByPlaceholder('Name').fill('test_var');
  const varName = page.getByPlaceholder('Name');
  const variableName = await varName.inputValue();
  console.log(variableName);
  await page.getByPlaceholder('Value').click();
  await page.getByPlaceholder('Value').fill('test123');
  await page.getByPlaceholder('Description').click();
  await page.getByPlaceholder('Description').fill('to test');
  await page.getByRole('button', { name: 'Update' }).click();
  const varTitle = page.getByRole('gridcell', { name: 'test_var' }).first();
  const varHeading = await varTitle.textContent();
  console.log(varHeading);
  expect(varHeading?.trim()).toContain(variableName);
  await page.getByRole('img').nth(3).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('tab', { name: 'Chrome Extension Setup' }).click();
  await expect(page.getByLabel('Chrome Extension Setup').locator('#variables')).toContainText('Extension ID');
});

test('gtpDashboardPageTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Dashboard');
  await page.getByRole('tab', { name: 'Executions', exact: true }).click();
  await expect(page.getByLabel('Executions', { exact: true })).toContainText('Total Server Side Executions ()');
  await page.getByRole('tab', { name: 'Scheduled Executions' }).click();
  await expect(page.getByLabel('Scheduled Executions')).toContainText('Total Schedule Data Executions ()');
  await page.getByRole('tab', { name: 'Devops Pipeline Executions' }).click();
  await expect(page.getByLabel('Devops Pipeline Executions')).toContainText('Total DevOps Pipeline Executions ()');
});

test('gtpDashboardPageTest1', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Dashboard');
  await page.getByRole('tab', { name: 'Executions', exact: true }).click();
  await expect(page.getByLabel('Executions', { exact: true })).toContainText('Total Server Side Executions ()');
  await page.getByRole('tab', { name: 'Scheduled Executions' }).click();
  await expect(page.getByLabel('Scheduled Executions')).toContainText('Total Schedule Data Executions ()');
  await page.getByRole('tab', { name: 'Devops Pipeline Executions' }).click();
  await expect(page.getByLabel('Devops Pipeline Executions')).toContainText('Total DevOps Pipeline Executions ()');
});

test('gtpLocatorElementTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Page Elements');
  await page.waitForTimeout(5000);
  await page.getByRole('row', { name: 'user-name' }).getByRole('img').first().dblclick();
  await page.getByLabel('Edit Locator').getByRole('button', { name: '' }).click();
  await expect(page.getByLabel('url')).toContainText('url');
  await expect(page.getByLabel('id')).toContainText('id');
  await expect(page.getByLabel('xpath')).toContainText('xpath');
  await expect(page.getByLabel('cssselector')).toContainText('cssselector');
    await expect(page.getByLabel('name', { exact: true })).toContainText('name');
  await expect(page.getByLabel('classname')).toContainText('classname');
  await expect(page.getByLabel('text')).toContainText('text');
  await expect(page.getByLabel('outerHTML')).toContainText('outerHTML');
  const editLocatorDialog = page.getByLabel('Edit Locator');
await editLocatorDialog.getByRole('button', { name: '' }).click();
});

test('gtpPageElementTest', async ({ page }) => {
  // Step 1: Login
  await login(page);

  // Step 2: Navigate to the project
  await page.getByRole('menuitem', { name: ' Projects' }).click();

  // ❗ Replace hard waits with assertions where possible
  await expect(page.locator('#projects')).toBeVisible({ timeout: 10000 });

  await page.locator('#projects').getByText('GTP-Demo').click();

  await expect(page.locator('#projects')).toBeHidden({ timeout: 10000 });

  // Step 3: Navigate to Page Elements
  await navigateTo(page, 'Page Elements');

  // Step 4: Create a new Page Element
  const pageName = 'PDP_Page';
  const pageNameInput = page.getByPlaceholder('Page Name');

  await pageNameInput.fill(pageName);
  console.log('Page Name:', pageName);

  await page.getByRole('button', { name: 'Submit' }).click();

  // Step 5: Wait for page heading to appear
  const heading = page.locator('#p-panel-1-titlebar').getByText(pageName);
  await expect(heading).toBeVisible({ timeout: 10000 });

  const headingText = await heading.textContent();
  console.log('Heading Text:', headingText);

  expect(headingText?.trim()).toContain(pageName);

  // Step 6: Click on 'Add Locator' button in panel 3
  await page.getByRole('button', { name: 'Add Locator' }).click();

  // Step 7: Fill out Locator details
  const plocatorName = 'addtocart';
  const pageLocatorName = page.getByPlaceholder('Locator Name');

  await pageLocatorName.fill(plocatorName);
  console.log('Locator Name:', plocatorName);

  await page.getByText('Locator Type', { exact: true }).click();
  await page.getByText('cssselector', { exact: true }).click();

  const locatorValueInput = page.getByPlaceholder('Locator Value');
  await locatorValueInput.click();
  await locatorValueInput.fill('#addtocart');

  // Save the locator
  await page.getByRole('button', { name: 'Save Locator' }).click();

  // Step 8: Confirm the locator appears in the list
  const locatorHeading = page
    .locator(`//td[contains(text(), "${plocatorName}")]`)
    .first();

  await expect(locatorHeading).toBeVisible({ timeout: 10000 });

  const headingText1 = await locatorHeading.textContent();
  console.log('Locator Heading Text:', headingText1);

  expect(headingText1?.trim()).toContain(plocatorName);

  // Step 9: Delete the Page Element (Optional cleanup)
  const deleteButton = page
    .locator('#p-panel-1-titlebar')
    .getByRole('button')
    .nth(1);

  await expect(deleteButton).toBeVisible();
  await deleteButton.click();

  const confirmYesButton = page.getByRole('button', { name: 'Yes' });
  await expect(confirmYesButton).toBeVisible();
  await confirmYesButton.click();

  console.log('Page Element deleted successfully');
});



  test('gtpSchedulerTest', async ({ page }) => {
    await login(page);
    await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
    await navigateTo(page, 'Test Plans');
    await page.waitForTimeout(5000);

    await page.getByText('sprint_01_release').click();
    await page.waitForTimeout(5000);

  await page.getByRole('tab', { name: 'Schedule' }).click();
  await page.getByRole('button', { name: 'Schedule' }).click();
  await page.getByLabel('Name').click();
  await page.getByLabel('Name').fill('unit_test_01');
  await page.getByRole('button', { name: '' }).click();
  await page.getByLabel('DAILY').click();
  await page.locator('p-calendar').getByRole('button').click();
  await page.getByText('20', { exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Schedule' }).click();
  await expect(
    page.getByLabel('Schedule').locator('tbody')
  ).toContainText('sprint_01_release', { timeout: 15000 }); // waits up to 15 seconds
  
});

test('gtpCICDTest', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.waitForTimeout(5000);

  await page.getByText('sprint_01_release').click();
  await page.waitForTimeout(5000);

  await page.getByRole('tab', { name: 'CI/CD' }).click();
  await expect(
    page.getByText('curl -k -v https://dev-api.')
  ).toBeVisible({ timeout: 15000 }); // waits up to 15 seconds for it to show up
  
});

test('gtpDeleteTestPlan', async ({ page }) => {
  await login(page);
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('GTP-Demo').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByRole('row', { name: 'sprint_01_release' }).getByRole('img').nth(3).click();
});
  

test('gtpDeleteProject', async ({ page }) => {
  await login(page);
  await navigateTo(page, 'Projects');
  await page.getByRole('row', { name: 'DemoProject1' }).getByRole('img').nth(2).click();
  await page.getByRole('button', { name: 'Yes' }).click();
});