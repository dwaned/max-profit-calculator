// Content for the Reports page. CI publishes the reports to GitHub Pages on
// every change to main (.github/workflows/reports.yml). `file` is relative to
// the Maven site (/reports/); `external` files sit at the Pages root; `href`
// is a full URL (source on GitHub, workflow runs).

const REPO = 'https://github.com/dwaned/max-profit-calculator';
const XREF = 'xref-test/com/maxprofit/calculator';

// The main reports, each with the question it answers and what to look for.
export const featuredReports = [
  {
    id: 'results',
    title: 'Test results',
    hex: '#34d399',
    icon: 'check',
    question: 'Did every test pass, and how long did they take?',
    lookFor: 'Failures first, then unusually slow tests: slow suites get run less often.',
    file: 'surefire-report.html',
  },
  {
    id: 'bdd',
    title: 'BDD acceptance scenarios',
    hex: '#f472b6',
    icon: 'conversation',
    question: 'Does the product do what the business agreed?',
    lookFor: 'Each scenario reads as plain language, with every Given / When / Then step marked passed or failed.',
    file: 'cucumber-report/index.html',
    external: true,
  },
  {
    id: 'mutation',
    title: 'Mutation testing',
    hex: '#facc15',
    icon: 'mutant',
    question: 'Would the tests catch a bug if one slipped in?',
    lookFor: 'Surviving mutants (in red): each is a change to the code that no test noticed.',
    file: 'pit-reports/index.html',
  },
  {
    id: 'coverage',
    title: 'Code coverage',
    hex: '#38bdf8',
    icon: 'gauge',
    question: 'Which code did the tests run?',
    lookFor: 'Red lines in important logic. Covered only means it ran, not that a test checked the result.',
    file: 'jacoco/index.html',
  },
  {
    id: 'browser',
    title: 'End-to-end browser report',
    hex: '#f87171',
    icon: 'browser',
    question: 'What happened in the browser during each user journey?',
    lookFor: 'Open a test to replay its trace: every action, screenshot and network call.',
    file: 'playwright-report/index.html',
    external: true,
  },
  {
    id: 'quality',
    title: 'Code style',
    hex: '#94a3b8',
    icon: 'shield',
    question: 'Does the code follow the agreed conventions?',
    lookFor: 'Any violation: the build fails on them, so this should be empty.',
    file: 'checkstyle.html',
  },
];

// Reports and source for each layer of the pyramid, and where its tests run.
export const layerReports = {
  e2e: {
    whereItRuns: 'In the reports run, against the built UI and the API.',
    links: [
      { label: 'BDD acceptance scenarios', description: 'Every scenario and step, run through the UI', file: 'cucumber-report/index.html', external: true },
      { label: 'Browser test report', description: 'End-to-end journeys with traces and screenshots', file: 'playwright-report/index.html', external: true },
      { label: 'Scenario results', description: 'The BDD run in the test results report', file: 'surefire-report.html#RunCucumberTest' },
    ],
  },
  system: {
    whereItRuns: 'In the container workflow, against the Docker images, so they are not part of the published test results.',
    links: [
      { label: 'Container workflow runs', description: 'System tests, API fuzzing and API performance', href: `${REPO}/actions/workflows/containers.yml` },
      { label: 'System test source', description: 'ContainerTests', file: `${XREF}/ContainerTests.html` },
      { label: 'Fuzzing configuration', description: 'schemathesis.toml', href: `${REPO}/blob/main/schemathesis.toml` },
    ],
  },
  contract: {
    whereItRuns: 'In the contract workflow on every pull request: the frontend generates the contract, the backend verifies it.',
    links: [
      { label: 'Contract workflow runs', description: 'Consumer test, provider verification, “can I deploy?”', href: `${REPO}/actions/workflows/contract-tests.yml` },
      { label: 'Consumer test source', description: 'calculate.api.test.js (frontend)', href: `${REPO}/blob/main/site/frontend/tests/pact/calculate.api.test.js` },
      { label: 'Provider verification source', description: 'LocalContractVerificationTest (backend)', file: `${XREF}/LocalContractVerificationTest.html` },
    ],
  },
  integration: {
    whereItRuns: 'In the reports run and on every pull request.',
    links: [
      { label: 'Test results', description: 'ApiSecurityTest and the other full-application tests', file: 'surefire-report.html#com.maxprofit.calculator.controller.ApiSecurityTest' },
      { label: 'Test source', description: 'ApiSecurityTest', file: `${XREF}/controller/ApiSecurityTest.html` },
    ],
  },
  web: {
    whereItRuns: 'In the reports run and on every pull request.',
    links: [
      { label: 'Test results', description: 'HTTP status tests (200 / 400 / 405 / 415 / 429)', file: 'surefire-report.html#/calculate%20endpoint%20HTTP%20status%20tests' },
      { label: 'Test source', description: 'CalculatorControllerHttpStatusTest', file: `${XREF}/controller/CalculatorControllerHttpStatusTest.html` },
    ],
  },
  unit: {
    whereItRuns: 'In the reports run and on every pull request; frontend unit tests in the frontend workflow.',
    links: [
      { label: 'Test results', description: 'Every Java test in the reports run', file: 'surefire-report.html' },
      { label: 'Code coverage', description: 'The build fails below 95% of lines or 80% of branches', file: 'jacoco/index.html' },
      { label: 'Production source', description: 'Cross-referenced, for reading alongside the reports', file: 'xref/index.html' },
    ],
  },
  performance: {
    whereItRuns: 'Algorithm checks in the reports run and on every pull request; API latency in the container workflow.',
    links: [
      { label: 'Algorithm results', description: 'StressTests: median time and memory at the maximum input', file: 'surefire-report.html#com.maxprofit.calculator.StressTests' },
      { label: 'Algorithm test source', description: 'StressTests', file: `${XREF}/StressTests.html` },
      { label: 'API performance source', description: 'ApiPerformanceTests', file: `${XREF}/ApiPerformanceTests.html` },
    ],
  },
};

export const projectReports = [
  { label: 'All Maven reports', file: 'index.html' },
  { label: 'Dependencies', file: 'dependencies.html' },
  { label: 'Project information', file: 'project-info.html' },
];
