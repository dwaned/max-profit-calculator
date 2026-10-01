import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { techniques } from '../../src/data/techniques';
import { layerOrder, lenses, safetyNet, testLayers, tradeoffLabels } from '../../src/data/testLayers';

// Keeps the Testing Pyramid page honest: it must list exactly the tests that
// exist in the repository, with the right counts, on the right layers.

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const allClasses = testLayers.flatMap((layer) => layer.testClasses.map((c) => ({ ...c, layer: layer.id })));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const relative = (file) => path.relative(REPO_ROOT, file).split(path.sep).join('/');

function testFilesInRepo() {
  const java = walk(path.join(REPO_ROOT, 'src/test/java'))
    .filter((f) => f.endsWith('.java'))
    // The Cucumber runner and its step definitions are represented by the feature file.
    .filter((f) => !/(RunCucumberTest|StepDefinitions)\.java$/.test(f));
  const features = walk(path.join(REPO_ROOT, 'src/test/resources')).filter((f) => f.endsWith('.feature'));
  const frontend = walk(path.join(REPO_ROOT, 'site/frontend/tests')).filter((f) => /\.(test|spec)\.js$/.test(f));
  return [...java, ...features, ...frontend].map(relative).sort();
}

/** Tests declared in a file, plus whether the runner expands some of them into several cases. */
function declaredTests(file) {
  const source = fs.readFileSync(path.join(REPO_ROOT, file), 'utf8');
  if (file.endsWith('.feature')) {
    return { declared: (source.match(/^\s*Scenario:/gm) || []).length, expands: false };
  }
  if (file.endsWith('.js')) {
    return { declared: (source.match(/^\s*(it|test)\(/gm) || []).length, expands: false };
  }
  const declared = (source.match(/^\s*@(Test|Property|ParameterizedTest|TestTemplate)\b/gm) || []).length;
  return { declared, expands: /@(ParameterizedTest|TestTemplate)\b/.test(source) };
}

describe('Testing Pyramid data', () => {
  it('lists only test files that exist', () => {
    const missing = allClasses.filter((c) => !fs.existsSync(path.join(REPO_ROOT, c.file)));
    expect(missing.map((c) => c.file)).toEqual([]);
  });

  it('lists every test file in the repository', () => {
    const listed = new Set(allClasses.map((c) => c.file));
    const unlisted = testFilesInRepo().filter((file) => !listed.has(file));
    expect(unlisted).toEqual([]);
  });

  it('shows test counts that match the source', () => {
    const mismatches = allClasses
      .filter((c) => !c.generated) // config-driven suites (e.g. Schemathesis) have no test methods
      .map((c) => ({ ...c, ...declaredTests(c.file) }))
      .filter((c) => (c.expands ? c.count < c.declared : c.count !== c.declared))
      .map((c) => `${c.name}: page says ${c.count}, source declares ${c.declared}`);
    expect(mismatches).toEqual([]);
  });

  it('places BDD acceptance scenarios on the UI / End-to-End layer', () => {
    expect(lenses.find((l) => l.id === 'bdd').appliesTo).toEqual(['e2e']);
    expect(techniques.find((t) => t.id === 'bdd').layers).toEqual(['e2e']);
    expect(layerOrder[0]).toBe('e2e');
    const bddClasses = allClasses.filter((c) => c.style === 'bdd');
    expect(bddClasses.length).toBeGreaterThan(0);
    expect(bddClasses.every((c) => c.layer === 'e2e')).toBe(true);
  });

  it('explains every layer: its question, what it catches and misses, and its trade-offs', () => {
    const problems = testLayers.flatMap((layer) => {
      const issues = [];
      if (!layer.question?.endsWith('?')) issues.push(`${layer.id}: question`);
      if (!layer.summary) issues.push(`${layer.id}: summary`);
      if (!(layer.catches?.length > 0)) issues.push(`${layer.id}: catches`);
      if (!(layer.blindSpots?.length > 0)) issues.push(`${layer.id}: blindSpots`);
      if (!layer.writeOneWhen) issues.push(`${layer.id}: writeOneWhen`);
      Object.keys(tradeoffLabels).forEach((name) => {
        const value = layer.tradeoffs?.[name];
        if (!Number.isInteger(value) || value < 1 || value > 5) issues.push(`${layer.id}: tradeoff ${name}`);
      });
      return issues;
    });
    expect(problems).toEqual([]);
  });

  it('draws every pyramid layer exactly once', () => {
    const pyramidLayers = testLayers.filter((l) => !l.crossCutting).map((l) => l.id);
    expect([...layerOrder].sort()).toEqual([...pyramidLayers].sort());
  });

  it('links techniques, lenses and pipeline steps only to layers that exist', () => {
    const ids = new Set(testLayers.map((l) => l.id));
    const referenced = [
      ...lenses.flatMap((lens) => lens.appliesTo),
      ...safetyNet.flatMap((stage) => stage.steps.flatMap((step) => step.layers)),
      ...techniques.flatMap((technique) => technique.layers),
    ];
    expect(referenced.filter((id) => !ids.has(id))).toEqual([]);
  });
});
