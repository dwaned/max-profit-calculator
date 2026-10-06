// Content for the Testing AI Agents page, after Angie Jones's "test pyramid for
// AI agents" (https://angiejones.tech/test-pyramid-for-ai-agents/). The classic
// pyramid sorts tests by type; this one sorts them by how much uncertainty each
// layer tolerates. Every layer points at the real tests of this project's stock
// advisor; tests/unit/testLayers.test.js checks the files and counts.

const JAVA = 'src/test/java/com/maxprofit/calculator/advisor';

export const agentSource = {
  author: 'Angie Jones',
  title: 'A test pyramid for AI agents',
  url: 'https://angiejones.tech/test-pyramid-for-ai-agents/',
};

export const agentLayers = [
  {
    id: 'deterministic',
    name: 'Deterministic foundations',
    shortName: 'Deterministic',
    hex: '#10b981',
    uncertainty: 'None',
    runs: 'Every pull request',
    classic: 'Unit tests',
    question: 'Is the code around the model correct?',
    summary: 'Most of an agent is ordinary software: the loop that calls the model, the tools it can use, the checks on what the model asks for, the limits that stop it running forever. Replace the model with a fake that gives scripted replies, and all of that can be tested like any other code: fast, free and with the same result every time.',
    catches: [
      'Tool arguments the code fails to validate, such as fractions, text or out-of-range prices',
      'A loop that never stops, or ignores an unknown tool the model invents',
      'Errors that are not fed back to the model so it can correct itself',
    ],
    blindSpots: [
      'Anything about how the real model behaves',
      'Prompts that read well to a person but confuse the model',
    ],
    realIssue: {
      title: 'The verifier and its edges',
      story: 'A property-based test checks the rule that marks an answer verified: “€8” counts, but “€18” or “€8.5” do not. Mutation testing then found one boundary no test covered (a number at exactly the largest integer), and a test was added.',
    },
    inThisProject: 'The tool’s argument checks, the agent loop with a scripted fake model, the verifier, and the Ollama client against a mock server.',
    testClasses: [
      { name: 'ProfitToolTests', style: 'example', count: 6, file: `${JAVA}/ProfitToolTests.java` },
      { name: 'StockAdvisorTests', style: 'property-based', count: 11, file: `${JAVA}/StockAdvisorTests.java` },
      { name: 'OllamaChatModelTest', style: 'example', count: 5, file: `${JAVA}/OllamaChatModelTest.java` },
    ],
  },
  {
    id: 'reproducible',
    name: 'Reproducible reality',
    shortName: 'Reproducible',
    hex: '#6366f1',
    uncertainty: 'Recorded once',
    runs: 'Every pull request',
    classic: 'Integration tests',
    question: 'Does the agent still follow the same path with a real model?',
    summary: 'Real conversations with the model are recorded once and replayed on every build. The tests check the flow (which tool was called, with which arguments, and whether the answer was verified), not the exact wording. If the prompt, a tool definition or a tool result changes, the replay no longer matches and the test asks for a new recording.',
    catches: [
      'A prompt or tool change that alters how the agent behaves',
      'Regressions in the flow of a real conversation, without paying for a model call',
    ],
    blindSpots: [
      'How the model behaves on runs that were not recorded',
      'Whether a newer or different model would do better or worse',
    ],
    realIssue: {
      title: 'The first recording caught the model guessing',
      story: 'Asked “I have 50 euros, which stocks should I buy?”, the model called the calculator with empty price lists. The tool rejected them and the model then asked for the prices. Changing one word of the prompt made all the replays fail with “re-record”, as intended.',
    },
    inThisProject: 'Six recorded conversations, from choosing the best stocks to declining an off-topic question.',
    testClasses: [
      { name: 'AdvisorReplayTests', style: 'replay', count: 6, file: `${JAVA}/AdvisorReplayTests.java` },
      { name: 'AdvisorControllerTest', style: 'example', count: 5, file: `${JAVA}/AdvisorControllerTest.java` },
    ],
  },
  {
    id: 'probabilistic',
    name: 'Probabilistic performance',
    shortName: 'Probabilistic',
    hex: '#f97316',
    uncertainty: 'Measured as rates',
    runs: 'On demand',
    classic: 'System tests and benchmarks',
    question: 'How often does the agent get it right?',
    summary: 'A model can answer the same question differently each time, so one run proves little. Ask each task many times and measure the rates: how often the right tool arguments are sent, how often the answer matches the calculator, how often the agent refuses to work with data it was never given. Set a floor for each rate and watch the trend.',
    catches: [
      'Failures that only show up some of the time',
      'Behaviour that changes when the prompt, the model or its settings change',
    ],
    blindSpots: [
      'Whether the wording is clear and correct, beyond the numbers it checks',
      'Tasks that are not in the task set',
    ],
    realIssue: {
      title: 'Ten runs found what two did not',
      story: 'Given today’s prices but no future prices, the model copied today’s prices as the forecast and calculated anyway in 10 of 10 runs. A quick two-run check had looked fine. The prompt now forbids assuming prices: the agent refused to calculate in 10 of 10 runs of that task, then 9 of 10 in the next full run. Much better, not perfect, and only repeated runs can show the difference.',
    },
    inThisProject: 'Eleven tasks, each asked ten times, against the local model.',
    testClasses: [
      { name: 'AdvisorEvaluation', style: 'eval', count: 1, file: `${JAVA}/AdvisorEvaluation.java` },
    ],
  },
  {
    id: 'judgment',
    name: 'Vibes and judgment',
    shortName: 'Judgment',
    hex: '#ef4444',
    uncertainty: 'Judged',
    runs: 'On demand',
    classic: 'Exploratory and acceptance testing',
    question: 'Is the answer actually good?',
    summary: 'Some qualities have no exact answer to compare against: is the explanation clear, is every claim supported? An LLM-as-judge grades answers against a written rubric. Using a different, larger model avoids a model grading its own family, and three votes per answer, with a fourth to break a tie, smooth out the judge’s own randomness.',
    catches: [
      'Answers that are technically right but unclear, too long or padded',
      'Claims the numbers do not support',
    ],
    blindSpots: [
      'The judge’s own mistakes: it is a model too',
      'Anything the rubric does not ask about',
    ],
    realIssue: {
      title: 'The judge needs judging too',
      story: 'The judge passed “both stocks would result in a loss” when one only broke even. It also passed one answer built on invented prices three times out of three, then failed an almost identical one three times out of three. Judges help, but their verdicts are evidence, not proof.',
    },
    inThisProject: 'A larger model from another family grades three answers per task against the rubric.',
    testClasses: [],
  },
];

// Pyramid order, top first.
export const agentLayerOrder = ['judgment', 'probabilistic', 'reproducible', 'deterministic'];
