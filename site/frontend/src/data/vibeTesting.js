// Content for the "vibe-testing" section of the Testing AI Agents page: how to
// test code that an AI coding agent wrote. Every example happened in this
// project, which was built largely by an AI coding agent working with a human QA.

export const vibeTesting = {
  intro:
    'Testing an agent is one half of today’s world. The other half is testing the code agents write. This project was built largely by an AI coding agent working with a human QA. Agents write code fast and always sound sure of it. These habits caught their mistakes here.',
  habits: [
    {
      id: 'confident',
      title: 'Confident is not correct',
      idea: 'An agent explains its choices fluently whether or not they are right. Domain judgment stays with people who know the domain.',
      happened:
        'The agent drew a “Web Layer” in the testing pyramid, a name from a web framework, not a test level. The project’s QA lead spotted it, and the tests moved into Integration, as the standard models have it.',
      practice: 'Review what the agent produced against the field’s standards, and ask it to cite its source.',
    },
    {
      id: 'really-ran',
      title: 'Only trust checks that really ran',
      idea: 'A green tick only means something if the check actually did its job. Agents (and people) verify the step they can see, not always the one that matters.',
      happened:
        'A security scan had shown green while failing on every run, because its errors were ignored. Later, a fix that passed the agent’s local check failed in CI: the scan job never downloaded the new file.',
      practice: 'Make failures loud, and confirm a change where it really runs, not only on the agent’s machine.',
    },
    {
      id: 'test-the-tests',
      title: 'Test the tests',
      idea: 'An agent asked for tests will write tests that pass. Whether they would fail when the code breaks is a separate question.',
      happened:
        'Mutation testing made 65 small bugs in the agent’s own advisor code. Its tests caught 64; the survivor showed a boundary no test checked, and a test was added.',
      practice: 'Run mutation testing on what the agent writes, and read the surviving mutants.',
    },
    {
      id: 'inputs',
      title: 'Let the computer think of the inputs',
      idea: 'Hand-written tests, by people or agents, cover the cases someone thought of. Generated inputs find the rest.',
      happened:
        'API fuzzing found that a request with a malformed multipart header crashed every endpoint with a server error. No written test had tried it.',
      practice: 'Add fuzzing or property-based tests wherever the agent touches input handling.',
    },
    {
      id: 'spec',
      title: 'Make “done” executable',
      idea: 'An agent can argue that its change is finished. A failing acceptance scenario or contract cannot be argued with.',
      happened:
        'BDD scenarios run through the real UI and a consumer-driven contract guards the API. Agent changes are only finished when both still pass.',
      practice: 'Write acceptance criteria as automated scenarios before asking an agent to build the feature.',
    },
    {
      id: 'human-merge',
      title: 'A person approves every merge',
      idea: 'The agent proposes, the checks verify, a person decides. Speed comes from the agent; responsibility stays human.',
      happened:
        'Every change here went through a pull request, the full checks and a human “yes”. Once, a merge happened while one check was still running; the rule became “wait for every check”.',
      practice: 'Keep pull requests small enough for a person to review, and never let the agent merge on its own.',
    },
  ],
};
