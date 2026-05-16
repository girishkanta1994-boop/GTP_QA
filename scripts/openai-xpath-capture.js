const { chromium } = require("playwright");

async function waitForComposer(page) {
  const candidates = [
    'textarea[placeholder*="Message"]',
    'textarea',
    'div[contenteditable="true"]',
  ];

  for (let i = 0; i < 60; i += 1) {
    for (const selector of candidates) {
      const el = page.locator(selector).first();
      if ((await el.count()) > 0 && (await el.isVisible().catch(() => false))) {
        return selector;
      }
    }
    await page.waitForTimeout(1000);
  }

  throw new Error("Composer input not found. Please make sure you are logged in and chat UI is open.");
}

async function sendPrompt(page, selector, text) {
  const input = page.locator(selector).first();
  await input.click();
  await input.fill(text);
  await input.press("Enter");
}

async function waitForAssistantResponse(page, previousCount) {
  const assistantBlocks = page.locator(
    '//div[@data-message-author-role="assistant"]'
  );

  await page.waitForFunction(
    ({ xpath, count }) => {
      const node = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      return node.snapshotLength > count;
    },
    { xpath: '//div[@data-message-author-role="assistant"]', count: previousCount },
    { timeout: 120000 }
  );

  const last = assistantBlocks.last();
  await last.waitFor({ state: "visible", timeout: 30000 });
  await page.waitForTimeout(2000);

  return last;
}

async function main() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto("https://openai.com/", { waitUntil: "domcontentloaded" });
    await page.goto("https://chatgpt.com/", { waitUntil: "domcontentloaded" });

    console.log("If prompted, log in manually. Waiting for chat composer...");
    const composerSelector = await waitForComposer(page);

    const assistantLocator = page.locator('//div[@data-message-author-role="assistant"]');
    const beforeFirstPrompt = await assistantLocator.count();

    await sendPrompt(page, composerSelector, "Answer in one word only.");
    const firstReply = await waitForAssistantResponse(page, beforeFirstPrompt);
    console.log("First reply:", (await firstReply.innerText()).trim());

    const beforeSecondPrompt = await assistantLocator.count();
    await sendPrompt(page, composerSelector, "Whats the total per capita income of the US citizen?");
    const secondReply = await waitForAssistantResponse(page, beforeSecondPrompt);
    const responseText = (await secondReply.innerText()).trim();

    const preferredXPath =
      '(//div[@data-message-author-role="assistant"]//div[contains(@class,"markdown")])[last()]';
    const fallbackXPath = '(//div[@data-message-author-role="assistant"])[last()]';

    console.log("\nCaptured assistant response:");
    console.log(responseText);
    console.log("\nXPath (preferred):");
    console.log(preferredXPath);
    console.log("\nXPath (fallback):");
    console.log(fallbackXPath);
    console.log("\nBrowser left open for inspection. Press Ctrl+C in terminal when done.");

    await new Promise(() => {});
  } catch (err) {
    console.error("Script failed:", err.message);
    await browser.close();
    process.exit(1);
  }
}

main();
