import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';
import { practiceDurationSeconds } from '../practiceDuration';

function hasDurationOnTestSession(route: string) {
  const source = readFileSync(resolve(__dirname, '../../../../app/tests', route), 'utf8');
  const file = ts.createSourceFile(route, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found = false;
  const visit = (node: ts.Node) => {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(file) === 'TestSession') {
      found = node.attributes.properties.some(property => ts.isJsxAttribute(property) && property.name.getText(file) === 'durationSeconds');
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

describe('practice test timer routes', () => {
  it('passes a duration into the common session from regular tests', () => {
    expect(hasDurationOnTestSession('[section]/[subsection].tsx')).toBe(true);
  });

  it('passes a duration into the common session from AI and random tests', () => {
    expect(hasDurationOnTestSession('ai-test.tsx')).toBe(true);
  });

  it('does not restart the countdown interval when the finish callback changes', () => {
    const route = 'TestSession.tsx';
    const source = readFileSync(resolve(__dirname, '..', route), 'utf8');
    const file = ts.createSourceFile(route, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const intervalEffects: ts.CallExpression[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.expression.getText(file) === 'useEffect' && node.arguments[0]?.getText(file).includes('setInterval')) {
        intervalEffects.push(node);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    expect(intervalEffects).toHaveLength(1);
    expect(intervalEffects[0].arguments[1]?.getText(file)).not.toContain('finish');
  });

  it('keeps valid server limits and gives generated tests a timed fallback', () => {
    expect(practiceDurationSeconds(300, 5)).toBe(300);
    expect(practiceDurationSeconds('600', 10)).toBe(600);
    expect(practiceDurationSeconds(undefined, 10)).toBe(600);
    expect(practiceDurationSeconds(0, 5)).toBe(300);
  });
});
