/**
 * Build a Teams Adaptive Card payload from Playwright JUnit output.
 * Matches the GTP channel summary layout (pass rate, summary table, per-script blocks).
 */
const fs = require('fs');
const path = require('path');

const junitPath = process.env.JUNIT_PATH || 'results/junit-results.xml';
const projectName = process.env.GTP_PROJECT || 'DemoProject1';
const browser = process.env.REPORT_BROWSER || 'Chromium';
const runUrl = process.env.RUN_URL || '';
const repo = process.env.REPO || '';
const branch = process.env.BRANCH || '';
const jobStatus = (process.env.JOB_STATUS || 'failure').toLowerCase();

function decodeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseJUnit(xml) {
  const suites = [];
  const suiteBlocks = xml.match(/<testsuite[\s\S]*?<\/testsuite>/g) || [];

  for (const block of suiteBlocks) {
    const name = decodeXml(block.match(/name="([^"]*)"/)?.[1] || 'Unknown suite');
    const suiteTime = Number(block.match(/time="([^"]*)"/)?.[1] || 0);
    const testcases = [];
    const caseBlocks = block.match(/<testcase[\s\S]*?(?:\/>|<\/testcase>)/g) || [];

    for (const tc of caseBlocks) {
      const tcName = decodeXml(tc.match(/name="([^"]*)"/)?.[1] || 'Unknown test');
      const tcTime = Number(tc.match(/time="([^"]*)"/)?.[1] || 0);
      const failed = /<failure[\s>]|<error[\s>]/i.test(tc);
      const skipped = /<skipped[\s>]/.test(tc);
      testcases.push({
        name: tcName,
        time: tcTime,
        status: skipped ? 'skipped' : failed ? 'failed' : 'passed',
      });
    }

    suites.push({ name, time: suiteTime, testcases });
  }

  return suites;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.round(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatDateTime() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function scriptDisplayName(suitePath) {
  const base = path.basename(suitePath).replace(/\.spec\.(ts|js)$/i, '');
  return base || suitePath;
}

function statusColor(status) {
  if (status === 'passed') return 'Good';
  if (status === 'failed') return 'Attention';
  return 'Accent';
}

function buildAdaptiveCard(suites) {
  const allTests = suites.flatMap((s) => s.testcases);
  const totalScripts = suites.length;
  const totalScenarios = allTests.length;
  const passed = allTests.filter((t) => t.status === 'passed').length;
  const failed = allTests.filter((t) => t.status === 'failed').length;
  const skipped = allTests.filter((t) => t.status === 'skipped').length;
  const totalDuration = suites.reduce((sum, s) => sum + s.time, 0);
  const passRate = totalScenarios === 0 ? 0 : (passed / totalScenarios) * 100;
  const allPassed = failed === 0 && totalScenarios > 0;

  const headerTitle = allPassed ? 'All Tests Passed' : 'Failures Detected';
  const headerStyle = allPassed ? 'good' : 'attention';
  const passRateText = `${passRate.toFixed(1)}% pass rate - ${passed}/${totalScenarios} scenarios passed`;

  const body = [
    {
      type: 'Container',
      style: headerStyle,
      bleed: true,
      items: [
        { type: 'TextBlock', text: headerTitle, weight: 'Bolder', size: 'Large', wrap: true },
        { type: 'TextBlock', text: passRateText, wrap: true, spacing: 'Small' },
      ],
    },
    {
      type: 'FactSet',
      facts: [
        { title: 'Project', value: projectName },
        { title: 'Browser', value: browser },
        { title: 'Executed at', value: formatDateTime() },
        { title: 'Total duration', value: formatDuration(totalDuration) },
        { title: 'Repository', value: repo || 'N/A' },
        { title: 'Branch', value: branch || 'N/A' },
      ],
    },
    { type: 'TextBlock', text: 'Test Execution Summary', weight: 'Bolder', size: 'Medium', spacing: 'Medium' },
    {
      type: 'Table',
      firstRowAsHeaders: true,
      columns: [{ width: 1 }, { width: 1 }, { width: 1 }, { width: 1 }, { width: 1 }],
      rows: [
        {
          type: 'TableRow',
          cells: [
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Metric', weight: 'Bolder' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Total', weight: 'Bolder' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Passed', weight: 'Bolder' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Failed', weight: 'Bolder' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Skipped', weight: 'Bolder' }] },
          ],
        },
        {
          type: 'TableRow',
          cells: [
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Scripts' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(totalScripts) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(suites.filter((s) => s.testcases.every((t) => t.status === 'passed')).length) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(suites.filter((s) => s.testcases.some((t) => t.status === 'failed')).length) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: '0' }] },
          ],
        },
        {
          type: 'TableRow',
          cells: [
            { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Scenarios' }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(totalScenarios) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(passed) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(failed) }] },
            { type: 'TableCell', items: [{ type: 'TextBlock', text: String(skipped) }] },
          ],
        },
      ],
    },
    { type: 'TextBlock', text: 'Scripts Executed', weight: 'Bolder', size: 'Medium', spacing: 'Large' },
  ];

  for (const suite of suites) {
    const sPassed = suite.testcases.filter((t) => t.status === 'passed').length;
    const sFailed = suite.testcases.filter((t) => t.status === 'failed').length;
    const sSkipped = suite.testcases.filter((t) => t.status === 'skipped').length;
    const suiteStatus = sFailed > 0 ? 'FAILED' : sSkipped > 0 && sPassed === 0 ? 'SKIPPED' : 'PASSED';
    const suiteColor = sFailed > 0 ? 'Attention' : 'Good';

    body.push({
      type: 'Container',
      style: 'emphasis',
      spacing: 'Medium',
      items: [
        {
          type: 'ColumnSet',
          columns: [
            {
              type: 'Column',
              width: 'stretch',
              items: [
                {
                  type: 'TextBlock',
                  text: scriptDisplayName(suite.name),
                  weight: 'Bolder',
                  wrap: true,
                },
              ],
            },
            {
              type: 'Column',
              width: 'auto',
              items: [{ type: 'TextBlock', text: suiteStatus, color: suiteColor, weight: 'Bolder' }],
            },
          ],
        },
        {
          type: 'TextBlock',
          text: `Duration: ${formatDuration(suite.time)} | Scenarios: ${sPassed} passed, ${sFailed} failed, ${sSkipped} skipped`,
          isSubtle: true,
          wrap: true,
          spacing: 'Small',
        },
        {
          type: 'Table',
          firstRowAsHeaders: true,
          columns: [{ width: 2 }, { width: 1 }, { width: 1 }],
          rows: [
            {
              type: 'TableRow',
              cells: [
                { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Scenario', weight: 'Bolder' }] },
                { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Status', weight: 'Bolder' }] },
                { type: 'TableCell', items: [{ type: 'TextBlock', text: 'Duration', weight: 'Bolder' }] },
              ],
            },
            ...suite.testcases.map((tc) => ({
              type: 'TableRow',
              cells: [
                { type: 'TableCell', items: [{ type: 'TextBlock', text: tc.name, wrap: true }] },
                {
                  type: 'TableCell',
                  items: [
                    {
                      type: 'TextBlock',
                      text: tc.status.toUpperCase(),
                      color: statusColor(tc.status),
                      weight: 'Bolder',
                    },
                  ],
                },
                { type: 'TableCell', items: [{ type: 'TextBlock', text: formatDuration(tc.time) }] },
              ],
            })),
          ],
        },
      ],
    });
  }

  if (runUrl) {
    body.push({
      type: 'ActionSet',
      actions: [{ type: 'Action.OpenUrl', title: 'Open GitHub Run', url: runUrl }],
    });
  }

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        contentUrl: null,
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          type: 'AdaptiveCard',
          version: '1.5',
          msteams: { width: 'Full' },
          body,
        },
      },
    ],
  };
}

function buildMessageCardFallback(suites) {
  const allTests = suites.flatMap((s) => s.testcases);
  const passed = allTests.filter((t) => t.status === 'passed').length;
  const failed = allTests.filter((t) => t.status === 'failed').length;
  const skipped = allTests.filter((t) => t.status === 'skipped').length;
  const total = allTests.length;
  const passRate = total === 0 ? 0 : (passed / total) * 100;

  const lines = suites.map((suite) => {
    const sPassed = suite.testcases.filter((t) => t.status === 'passed').length;
    const sFailed = suite.testcases.filter((t) => t.status === 'failed').length;
    const status = sFailed > 0 ? 'FAILED' : 'PASSED';
    return `**${scriptDisplayName(suite.name)}** - ${status} (${sPassed} passed, ${sFailed} failed)`;
  });

  return {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    themeColor: failed > 0 ? 'E81123' : '2EB886',
    summary: failed > 0 ? 'Failures Detected' : 'All Tests Passed',
    title: failed > 0 ? 'Failures Detected' : 'All Tests Passed',
    sections: [
      {
        activityTitle: `${passRate.toFixed(1)}% pass rate - ${passed}/${total} scenarios passed`,
        facts: [
          { name: 'Project', value: projectName },
          { name: 'Browser', value: browser },
          { name: 'Scenarios passed', value: String(passed) },
          { name: 'Scenarios failed', value: String(failed) },
          { name: 'Scenarios skipped', value: String(skipped) },
          { name: 'Repository', value: repo },
          { name: 'Branch', value: branch },
        ],
        text: `${lines.join('\n\n')}\n\n[Open run](${runUrl})`,
      },
    ],
  };
}

function main() {
  if (!fs.existsSync(junitPath)) {
    console.error(`JUnit file not found: ${junitPath}`);
    process.exit(1);
  }

  const xml = fs.readFileSync(junitPath, 'utf8');
  const suites = parseJUnit(xml);

  const useAdaptive = process.env.TEAMS_CARD_FORMAT !== 'messagecard';
  const payload = useAdaptive ? buildAdaptiveCard(suites) : buildMessageCardFallback(suites);

  const outPath = process.env.TEAMS_PAYLOAD_PATH || 'results/teams-payload.json';
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));

  console.log(`Teams payload written to ${outPath}`);
  console.log(`Job status: ${jobStatus}, suites: ${suites.length}, scenarios: ${suites.flatMap((s) => s.testcases).length}`);
}

main();
