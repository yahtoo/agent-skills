#!/usr/bin/env node
/**
 * validate-agents.js
 *
 * Validates persona definitions and the explicit reference inventory in
 * skills/multi-agent-orchestration/SKILL.md.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, 'agents');
const SKILLS_DIR = path.join(ROOT, 'skills');
const ORCHESTRATION_SKILL = path.join(SKILLS_DIR, 'multi-agent-orchestration', 'SKILL.md');

function parseFrontmatter(content) {
  const match = content.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n/);
  if (!match) return null;

  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) result[key] = value;
  }
  return result;
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((file) => file.endsWith('.md') && file !== 'README.md')
    .sort();
}

function directories(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
    .sort();
}

function validateAgents() {
  const errors = [];
  const files = markdownFiles(AGENTS_DIR);

  for (const file of files) {
    const expectedName = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
    const fm = parseFrontmatter(content);

    if (!fm) {
      errors.push(`${file}: missing or malformed YAML frontmatter`);
      continue;
    }

    if (fm.name !== expectedName) {
      errors.push(`${file}: frontmatter name '${fm.name || ''}' must match '${expectedName}'`);
    }

    if (!fm.description) {
      errors.push(`${file}: frontmatter missing description`);
    }

    if (!/^##\s+(Output Format|输出格式|审查输出模板)/m.test(content)) {
      errors.push(`${file}: missing output format section`);
    }

    if (!/^##\s+(Composition|组合方式)/m.test(content)) {
      errors.push(`${file}: missing Composition section`);
    }

    if (!/(Do not invoke from another persona|不要从另一个 persona 中调用)/.test(content)) {
      errors.push(`${file}: Composition must prohibit persona-to-persona invocation`);
    }
  }

  return { errors, knownAgents: new Set(files.map((file) => file.replace(/\.md$/, ''))) };
}

function extractValidatedRefs(content, label) {
  const pattern = new RegExp(`\\*\\*${label}:\\*\\*([^\\n]+)`);
  const match = content.match(pattern);
  if (!match) return null;
  return [...match[1].matchAll(/`([a-z][a-z0-9-]*[a-z0-9])`/g)].map((m) => m[1]);
}

function validateOrchestrationReferences(knownAgents) {
  const errors = [];
  if (!fs.existsSync(ORCHESTRATION_SKILL)) {
    errors.push('multi-agent-orchestration: missing SKILL.md');
    return errors;
  }

  const content = fs.readFileSync(ORCHESTRATION_SKILL, 'utf8');
  const knownSkills = new Set(directories(SKILLS_DIR));

  const personaRefs = extractValidatedRefs(content, 'Personas');
  const skillRefs = extractValidatedRefs(content, 'Skills');

  if (!personaRefs) {
    errors.push('multi-agent-orchestration: missing **Personas:** validated references line');
  } else {
    for (const ref of personaRefs) {
      if (!knownAgents.has(ref)) {
        errors.push(`multi-agent-orchestration: unknown persona reference '${ref}'`);
      }
    }
  }

  if (!skillRefs) {
    errors.push('multi-agent-orchestration: missing **Skills:** validated references line');
  } else {
    for (const ref of skillRefs) {
      if (!knownSkills.has(ref)) {
        errors.push(`multi-agent-orchestration: unknown skill reference '${ref}'`);
      }
    }
  }

  return errors;
}

function main() {
  const { errors, knownAgents } = validateAgents();
  errors.push(...validateOrchestrationReferences(knownAgents));

  if (errors.length > 0) {
    for (const error of errors) console.log(`  ✗ ${error}`);
    console.log(`\nAgent validation FAILED — ${errors.length} error(s)`);
    process.exit(1);
  }

  console.log(`  ✓ ${knownAgents.size} agent persona(s) checked`);
  console.log('  ✓ multi-agent-orchestration references checked');
  console.log('\nAgent validation PASSED');
}

main();
