import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';
import config from '../../config/config.json';
import * as fs from 'fs';
import * as XLSX from "xlsx";
import * as path from 'path';

// These tests share DemoProject1 / sprint_01_release / etc. — must not run in parallel with each other.
test.describe.configure({ mode: 'serial', timeout: 120000 });

type GtpConfig = typeof config & {
  executionProjectName?: string;
  aiRegressionProjectName?: string;
};
const gtpConfig = config as GtpConfig;
const executionProjectName = gtpConfig.executionProjectName ?? 'DemoTest';
const aiRegressionProjectName = gtpConfig.aiRegressionProjectName ?? 'AI_ClassBuddyTesting';

const filePath = path.resolve(__dirname, './classBuddyAI.xlsx');
const sheetName ="Sheet1";

//Read Data file
function readExcel(filePath: string, sheetName?: string): any[] {
  // Read workbook
  const workbook = XLSX.readFile(filePath);

  // Select sheet (default: first sheet)
  const worksheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];

  // Convert sheet to array of rows
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Return only the first row
  return rows[0];  
}

//Login
test.beforeEach('login to application', async ({ page }) => {

  await page.goto(config.url);
  await page.fill('input[name="email"]', config.username);
  await page.fill('input[name="password"]', config.password);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click({ timeout: 60000 });
  await page.waitForSelector('app-sidebar', { state: 'visible', timeout: 60000 });
})


async function navigateTo(page: Page, menuLabel: string | RegExp) {
  const pattern = typeof menuLabel === 'string' ? new RegExp(menuLabel, 'i') : menuLabel;
  await page.getByRole('menuitem', { name: pattern }).click({ timeout: 60000 });
}

/** CI retries / partial runs can leave the project behind; duplicate title keeps wizard Save disabled. */
async function deleteProjectByTitleIfExists(page: Page, title: string) {
  await navigateTo(page, 'Projects');
  await page.waitForTimeout(1500);
  const row = page.getByRole('row', { name: title });
  if ((await row.count()) === 0) {
    return;
  }
  await row.first().getByRole('img').nth(2).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.waitForTimeout(3000);
}

// Test for Project Creation
test('gtpProjectCreationTest', async ({ page }) => {

  await deleteProjectByTitleIfExists(page, config.projectTitle);
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
  await page.waitForTimeout(1000);
  const wizardSave = page.locator('app-projects').getByRole('button', { name: /^Save$/i }).last();
  await expect(wizardSave).toBeVisible({ timeout: 30000 });
  await expect(wizardSave).toBeEnabled({ timeout: 90000 });
  await wizardSave.click();
  await page.waitForTimeout(5000);
  await expect(page.locator('app-header')).toContainText(config.projectTitle);

});

// Test for Test Case Creation
test('gtpTestsCreationTest', async ({ page }) => {

  await navigateTo(page, 'Tests');
  await page.getByRole('button', { name: 'Add New Test' }).click();
  await page.getByText('Test Name *', { exact: true }).waitFor({ state: 'visible' });
  await page.getByRole('textbox', { name: 'Test Name' }).fill('verify_checkout');
  await page.getByPlaceholder('Description').fill('To Verify Checkout Functionality');
  await page.waitForTimeout(5000);
  await page.getByRole('combobox').getByRole('textbox').fill('smoke_ver_01');
  await page.waitForTimeout(2000);
  await page.getByLabel('Options list').getByText('smoke_ver_01').click();
  await page.getByPlaceholder('Description').fill('To Verify Checkout Functionality');
  await page.waitForTimeout(2000);
  await page.getByRole('button', { name: 'Create Test', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'verify_checkout' })).toBeVisible();

});

// Test for Test Plan Creation
test('gtpTestPlanCreationTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: /Projects/i }).click({ timeout: 60000 });
  await page.locator('#projects').getByText('DemoProject1').waitFor({ state: 'visible' });
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByRole('button', { name: 'Add Test Plan' }).click();
  await page.getByPlaceholder('Sprint1').fill('sprint_01_release');
  await page.locator('textarea').fill('Sprint release testing');
  await page.getByRole('button', { name: 'Add Tests' }).click();
  await expect(page.getByRole('option')).toContainText('verify_checkout');
  await page.locator('p-picklist').getByRole('button').nth(1).click();
  await page.getByLabel('Add Test').getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Add Environment' }).click();
  await page.getByRole('button', { name: 'Icon Add New Environment' }).click();
  await page.getByLabel('Add New Environment').getByRole('button', { name: '' }).click();
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByText('Save').click();
  await page.locator('text=Add Test Plan').waitFor();
  await expect(page.getByText('sprint_01_release')).toBeVisible();

});

// Skipped: requires executionProjectName + test plan row named "test" in target env.
// Test for Test Execution (needs project `executionProjectName` in config, default DemoTest)
test.skip('gtpTestsExecutionTest', async ({ page }) => {
  await page.getByRole('menuitem', { name: /Projects/i }).click({ timeout: 60000 });
  await page.getByRole('button', { name: '' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).fill(executionProjectName);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText(executionProjectName, { exact: true }).click();
  await page.waitForTimeout(5000);
  await page.getByRole('menuitem', { name: /Test Plans/i }).click({ timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.getByText('test', { exact: true }).click();
  await page.getByRole('button', { name: 'Execute' }).click();
  await expect(page.getByLabel('Inprogress (1)').locator('p-table')).toContainText('test', {
    timeout: 60000,
  });
});

//Allow user to create Testplan with no tests
test('Allow user to create test plan with no tests', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.locator('#projects').getByText('DemoProject1').waitFor();
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByRole('button', { name: 'Add Test Plan' }).click();
  await page.getByPlaceholder('Sprint1').click();
  await page.getByPlaceholder('Sprint1').fill('Regression');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Regression', { exact: true })).toBeVisible();

})

//Verify Page Elements properties
test('gtpPageElementTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await expect(page.locator('#projects')).toBeVisible({ timeout: 10000 });
  await page.locator('#projects').getByText('DemoProject1').click();
  await expect(page.locator('#projects')).toBeHidden({ timeout: 10000 });
  await navigateTo(page, 'Page Elements');
  const pageName = 'PDP_Page';
  const pageNameInput = page.getByPlaceholder('Page Name');
  await pageNameInput.fill(pageName);
  console.log('Page Name:', pageName);
  await page.getByRole('button', { name: 'Submit' }).click();
  // Panel index varies (p-panel-0 vs p-panel-1); scope by titlebar that contains this page name.
  const panelTitlebar = page
    .locator('[id$="-titlebar"]')
    .filter({ has: page.getByText(pageName, { exact: true }) })
    .first();
  await expect(panelTitlebar).toBeVisible({ timeout: 60000 });
  const headingText = await panelTitlebar.textContent();
  console.log('Heading Text:', headingText);
  expect(headingText?.trim()).toContain(pageName);
  await page.getByRole('button', { name: 'Add Locator' }).click();
  const plocatorName = 'addtocart';
  const pageLocatorName = page.getByPlaceholder('Locator Name');
  await pageLocatorName.fill(plocatorName);
  console.log('Locator Name:', plocatorName);
  await page.getByText('Locator Type', { exact: true }).click();
  await page.getByText('cssselector', { exact: true }).click();
  const locatorValueInput = page.getByPlaceholder('Locator Value');
  await locatorValueInput.click();
  await locatorValueInput.fill('#addtocart');
  await page.getByRole('button', { name: 'Save Locator' }).click();
  await expect(
    page.locator('tbody').getByText(plocatorName, { exact: true }).first()
  ).toBeVisible({ timeout: 60000 });
  const locatorHeading = page.locator(`//td[contains(text(), "${plocatorName}")]`).first();
  await expect(locatorHeading).toBeVisible({ timeout: 10000 });
  const headingText1 = await locatorHeading.textContent();
  console.log('Locator Heading Text:', headingText1);
  expect(headingText1?.trim()).toContain(plocatorName);
  const deleteButton = panelTitlebar.getByRole('button').nth(1);
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  const confirmYesButton = page.getByRole('button', { name: 'Yes' });
  await expect(confirmYesButton).toBeVisible();
  await confirmYesButton.click();
  console.log('Page Element deleted successfully');

});

// Test for Configuration
test('gtpConfigurationTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Configuration');
  await page.getByRole('button', { name: 'Icon Add New Environment' }).click();
  await page.getByRole('tab', { name: 'Desktop' }).click();
  await page.getByLabel('Desktop').getByText('OS', { exact: true }).click();
  await page.locator('.p-dropdown-filter').click();
  await page.locator('.p-dropdown-filter').fill('windows 11');
  await page.waitForTimeout(1000);
  await page.getByLabel('Windows').locator('div').first().click();
  await page.getByRole('button', { name: 'Save Environment' }).click();
  await expect(page.locator('tbody')).toContainText('Windows 11');

});

//Create API test
test('gtpAPITest', async ({ page }) => {
  
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.locator('#projects').getByText('DemoProject1').waitFor();
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(2000);
  await navigateTo(page, 'Tests');
  await page.getByRole('tab', { name: 'API Tests' }).click();
  await page.getByRole('button', { name: 'Add New Test' }).click();
  const testName = 'check_post';
  await page.getByRole('textbox', { name: 'Test Name' }).fill(testName);
  await page.locator('div').filter({ hasText: /^Add Tags$/ }).nth(2).click();
  await page.getByRole('combobox').getByRole('textbox').fill('post_req');
  const tagElement = await page.getByText('post_req');
  await expect(tagElement).toBeVisible();
  await tagElement.click();
  await page.getByRole('button', { name: 'Create Test' }).click();
  const apiHeading = await page.getByRole('heading', { name: testName }).textContent();
  console.log('API Heading:', apiHeading);
  expect(apiHeading?.trim()).toBe(testName);
  await page.getByRole('button', { name: 'Create API Test' }).click();
  await page.getByPlaceholder('Scenario Name').fill('check_post_req');
  await page.waitForTimeout(2000);
  await page.locator('div').filter({ hasText: /^Request MethodGET$/ }).first().click();
  await page.getByLabel('POST').waitFor({ state: 'visible' });
  await page.getByLabel('POST').click();
  await page.getByPlaceholder('API Endpoint').fill('https://api.restful-api.dev/objects');
  await page.getByText('None').click();
  await page.getByText('JSON').click();
  const jsonPayload = `{
   "name": "Apple MacBook Pro 16"
  }`;
  const jsonInput = await page.getByPlaceholder('Enter JSON').fill(jsonPayload);
  await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Send Request' }).click();
  await page.waitForTimeout(1000);
  await expect(page.getByText('200')).toBeVisible();
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByLabel('check_post_req').getByText(/Tree|object|\{/)
  ).toBeVisible({ timeout: 60000 });

});

//Delete API Test
test('gtpDeleteAPITest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Tests');
  await page.getByRole('tab', { name: 'API Tests' }).click();
  await page.getByRole('img').nth(4).click();
  await page.getByRole('button', { name: 'Yes' }).click();

});


//Test Project Settings Page
test('gtpProectSettingsTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Project Settings');
  await page.waitForTimeout(5000);
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
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Yes' }).click();
  await page.getByRole('tab', { name: 'Chrome Extension Setup' }).click();
  await expect(page.getByLabel('Chrome Extension Setup').locator('#variables')).toContainText('Extension ID');

});


//Verify Dashboard features
test('gtpDashboardPageTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Dashboard');
  await page.getByRole('tab', { name: 'Executions', exact: true }).click();
  await expect(page.getByLabel('Executions', { exact: true })).toContainText('Total Server Side Executions');
  await page.getByRole('tab', { name: 'Scheduled Executions' }).click();
  await expect(page.getByLabel('Scheduled Executions')).toContainText('Total Schedule Data Executions');
  await page.getByRole('tab', { name: 'Devops Pipeline Executions' }).click();
  await expect(page.getByLabel('Devops Pipeline Executions')).toContainText('Total DevOps Pipeline Executions');

});

//Locators Element test
test('gtpLocatorElementTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.locator('#projects').getByText('DemoProject1').waitFor();
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Page Elements');
  await page.getByText(' Add New Page ').waitFor();
  await page.getByRole('textbox', { name: 'Page Name' }).fill('user_name');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByLabel(' user_name ').waitFor();
  await page.getByRole('button', { name: 'Add Locator' }).click();
  await page.getByRole('textbox', { name: 'Locator Name' }).fill('user_name');
  await page.getByText('Locator Type', { exact: true }).click();
  await page.getByLabel('name', { exact: true }).click();
  await page.getByRole('textbox', { name: 'Locator Value' }).fill('name');
  await page.getByRole('button', { name: 'Save Locator' }).click();
  await page.getByRole('img').nth(2).click();
  await page.locator('//label[text()=" Locator Type "]//following::span[contains(@class,"p-dropdown-label p-inputtext ng-star-inserted")]').click();
  await expect(page.getByLabel('name', { exact: true })).toContainText('name');
  await expect(page.getByLabel('id')).toContainText('id');
  await expect(page.getByLabel('xpath')).toContainText('xpath');
  await expect(page.getByLabel('cssselector')).toContainText('cssselector');
  await expect(page.getByLabel('name', { exact: true })).toContainText('name');
  await expect(page.getByLabel('classname')).toContainText('classname');
  await expect(page.getByLabel('text')).toContainText('text');
  await expect(page.getByLabel('outerHTML')).toContainText('outerHTML');
  await expect(page.getByLabel('pwSimpleSelector')).toContainText('pwSimpleSelector');
  await page.getByLabel('id').getByText('id', { exact: true }).click();
  await page.getByPlaceholder('Locator Value', { exact: true }).fill('test01');
  await page.locator('.p-button-label').and(page.getByText('Update Locator')).click();

});




// Create Scheduler
test('gtpSchedulerTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.locator('#projects').getByText('DemoProject1').waitFor();
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.waitForTimeout(3000);
  await page.getByText('sprint_01_release').click();
  await page.getByRole('tab', { name: 'Schedule' }).waitFor();
  await page.getByRole('tab', { name: 'Schedule' }).click();
  await page.getByRole('button', { name: 'Schedule' }).click();
  const strConfirm = await page.getByText('Confirm', { exact: true });
  if (await strConfirm.isVisible()) {
    await page.getByText('Yes').click();
    await page.getByRole('button', { name: 'Icon Add New Environment' }).click();
    await page.getByLabel('Add New Environment').getByRole('button', { name: '' }).click();
    await page.getByRole('button', { name: 'Submit' }).click();
    await page.getByText('Save').click();
    await page.getByRole('button', { name: 'Schedule' }).click();
    await page.getByLabel('Name').click();
  } else {
    await page.getByLabel('Name').click();
  }
  await page.getByLabel('Name').fill('unit_test_01');
  await page.getByRole('button', { name: '' }).click();
  await page.getByLabel('DAILY').click();
  await page.locator('p-calendar').getByRole('button').click();
  const today = new Date();
  const dayOfMonth = today.getDate();
  console.log('Day of the Month:', dayOfMonth);
  await page.locator('//span[@tabindex="0"]').click();
  await page.getByRole('dialog').getByRole('button', { name: 'Schedule' }).click();
  await page.waitForTimeout(5000);
  await expect(
    page.getByLabel('Schedule').locator('tbody')
  ).toContainText('sprint_01_release', { timeout: 15000 });

});

//Create CICDTest
test('gtpCICDTest', async ({ page }) => {

  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.locator('#projects').getByText('DemoProject1').waitFor();
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByText('sprint_01_release').waitFor();
  await page.getByText('sprint_01_release').click();
  await page.waitForTimeout(5000);
  await page.getByRole('tab', { name: 'CI/CD' }).click();
  if (await page.getByText('Confirm').isVisible()) {
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByText('curl -k -v')).toBeVisible({ timeout: 15000 });
  } else {
    await expect(page.getByText('curl -k -v')).toBeVisible({ timeout: 15000 });
  }

});

//Delete the TestPlan
test('gtpDeleteTestPlan', async ({ page }) => {
 
  await page.getByRole('menuitem', { name: ' Projects' }).click();
  await page.waitForTimeout(5000);
  await page.locator('#projects').getByText('DemoProject1').click();
  await page.waitForTimeout(5000);
  await navigateTo(page, 'Test Plans');
  await page.getByRole('row', { name: 'sprint_01_release' }).getByRole('img').nth(3).click();

});

//Delete the Project
test('gtpDeleteProject', async ({ page }) => {

  await navigateTo(page, 'Projects');
  await page.getByRole('row', { name: 'DemoProject1' }).getByRole('img').nth(2).click();
  await page.getByRole('button', { name: 'Yes' }).click();

});

//Validate AI LLM Testcase
test('AI LLM', async ({ page }) => {
  test.skip(!fs.existsSync(filePath), `Skipping: missing ${path.basename(filePath)} (add under tests/gtpRegression/).`);

  await navigateTo(page, 'Projects');
  await page.getByRole('button', { name: '' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).click();
  await page.getByRole('textbox', { name: 'Project Name' }).fill(aiRegressionProjectName);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.locator('#projects').getByText(aiRegressionProjectName).click();
  await page.getByLabel('Browser Tests').getByText('Classbuddy AI Test',{exact:true}).click();
  await page.getByRole('button', { name: 'Open in Test Editor' }).waitFor({ state: 'visible' });
  await page.locator('#p-panel-0-titlebar').getByRole('button', { name: 'More Actions' }).click();
  await page.locator('a').filter({ hasText: 'View Data' }).click();

  const firstRow = readExcel(filePath, sheetName);
  console.log(firstRow);
  const columnsLength = firstRow.length;
  const columnNames = firstRow[0];

  console.log('View data Columns count --> ' + columnsLength)
  for (let i = 0; i < columnsLength; i++) {
    const columnNames = firstRow[i];
    await expect(page.getByRole('cell', { name: columnNames, exact: true })).toBeVisible();
    console.log('Column '+columnNames+' is present')
  }
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('menuitem', { name: ' Results' }).click();
  await page.getByRole('tab', { name: 'Tests Results' }).waitFor({ state: 'visible' });
  await page.getByRole('tab', { name: 'Tests Results' }).click();
  //uncomment this for dev
  //await page.locator('//tbody[@class="p-datatable-tbody" and @ng-reflect-frozen="false"]/tr[1]/td[1]/div').click();
  await page.locator('//tbody[@class="p-datatable-tbody"]/tr[2]/td[1]/div').click();

  await expect(page.getByRole('gridcell', { name: 'Action', exact: true })).toBeVisible({
    timeout: 60000,
  });
  await page.waitForTimeout(10000);
  const scenarios = await page.locator('//div[@class="scenario-buttons-scroll"]/button');
  const scenariosCount = await scenarios.count();
  console.log('Total Scenario Executed --> ' + scenariosCount);
  for (let i = 0; i < scenariosCount; i++) {
    await page.locator('//div[@class="scenario-buttons-scroll"]/button').nth(i).click();
    await page.locator('//td[text()="AssertChatResponse"]//preceding::td[2]/button').nth(i).click();

    //uncomment this for dev
    //const getText = await page.locator('//p[@ng-reflect-ng-class="text-red-500" or @ng-reflect-ng-class="text-green-500"]').nth(i).textContent();
    const getText = await page.locator('//p[contains(@class,"500")]').nth(i).textContent();
    console.log('Status of scenario ' + i + ' --> ' + getText);
  }
  await page.getByRole('button', { name: 'AI Eval Report' }).click();
  const accuracy = await page.locator('//div[@class="font-semibold text-base mb-2"]').textContent();
  if (accuracy && accuracy.includes('100%')) {
    console.log('AI Test case Passed');
  } else {
    console.log('AI Test case Failed');
  }

  for (let j = 0; j < columnsLength; j++) {
    const columnName = firstRow[j];
    const textName = await page.getByRole('gridcell', { name: columnName, exact: true });
    if (await textName.count() == 0) {
      await page.getByLabel('Configure Columns').click();
      await page.getByText(columnName, { exact: true }).click();
    }
    await page.getByRole('heading', { name: 'AI Agent/Chatbot Eval Details' }).click();
    await expect(page.getByRole('gridcell', { name: columnName, exact: true })).toBeVisible();
  }
  await page.getByLabel('Configure Columns').click();
  await page.getByRole('button', { name: 'Reset to Default', exact: true }).click();

})

//Logout
test.afterEach('logout', async ({ page }) => {
  await page.locator('button[icon="pi pi-angle-down"]').waitFor();
  await page.locator('button[icon="pi pi-angle-down"]').click();
  await page.getByText('Logout').click();

})

