#!/usr/bin/env node
/**
 * Read-only pre-migration audit for 5e Complete compendium JSONL files.
 * Run from the module root: node tools/audit-compendia.mjs
 *
 * This deliberately does not rewrite data. Foundry/dnd5e migrations must be
 * tested in a disposable world before any source pack is changed.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packsDir = path.join(root, "packs");
const manifestPath = path.join(root, "module.json");
const errors = [];
const warnings = [];
const packIds = new Set();
const recordsByPack = new Map();
const refs = [];

function report(level, message) {
  (level === "ERROR" ? errors : warnings).push(message);
}

try {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const pack of manifest.packs ?? []) packIds.add(pack.name);
  console.log(`Manifest module id: ${manifest.id}`);
  console.log(`Declared compendium packs: ${packIds.size}`);

  const files = (await readdir(packsDir)).filter((name) => name.endsWith(".db")).sort();
  if (!files.length) report("ERROR", "No .db compendium files found in packs/.");

  for (const file of files) {
    const fullPath = path.join(packsDir, file);
    const text = await readFile(fullPath, "utf8");
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
    const seenIds = new Set();
    let parsed = 0;

    for (let i = 0; i < lines.length; i++) {
      let doc;
      try {
        doc = JSON.parse(lines[i]);
        parsed++;
      } catch (error) {
        report("ERROR", `${file}:${i + 1}: invalid JSONL record (${error.message})`);
        continue;
      }

      if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
        report("ERROR", `${file}:${i + 1}: record is not a JSON object.`);
        continue;
      }
      if (typeof doc._id !== "string" || !doc._id) {
        report("ERROR", `${file}:${i + 1}: missing string _id.`);
      } else if (seenIds.has(doc._id)) {
        report("ERROR", `${file}:${i + 1}: duplicate _id ${doc._id}.`);
      } else {
        seenIds.add(doc._id);
      }
      if (doc.data && !doc.system) {
        report("WARN", `${file}:${i + 1}: legacy-looking data field without system; verify against dnd5e 6.x schema.`);
      }

      const serialized = JSON.stringify(doc);
      const re = /@Compendium\[([^\].]+)\.([^\].]+)\.([^\]]+)\]/g;
      for (const match of serialized.matchAll(re)) {
        refs.push({ file, line: i + 1, namespace: match[1], pack: match[2], id: match[3] });
      }
    }
    recordsByPack.set(file.replace(/\.db$/, ""), { lines: lines.length, parsed });
    if (lines.length !== parsed) {
      report("ERROR", `${file}: parsed ${parsed}/${lines.length} non-empty lines.`);
    }
  }

  const namespaces = new Map();
  for (const ref of refs) {
    if (!namespaces.has(ref.namespace)) namespaces.set(ref.namespace, 0);
    namespaces.set(ref.namespace, namespaces.get(ref.namespace) + 1);
    if (!packIds.has(ref.pack)) {
      report("WARN", `${ref.file}:${ref.line}: reference points to undeclared pack "${ref.pack}" (${ref.namespace}.${ref.pack}.${ref.id}).`);
    }
    if (ref.namespace !== manifest.id) {
      report("WARN", `${ref.file}:${ref.line}: reference namespace "${ref.namespace}" differs from manifest id "${manifest.id}".`);
    }
  }

  console.log("\nCompendium record counts:");
  for (const [name, value] of recordsByPack) {
    console.log(`  ${name}: ${value.parsed} records`);
  }
  console.log("\nReference namespaces:");
  if (!namespaces.size) console.log("  (none found)");
  for (const [namespace, count] of namespaces) console.log(`  ${namespace}: ${count} references`);
} catch (error) {
  console.error(`Audit could not complete: ${error.message}`);
  process.exit(2);
}

console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const message of errors) console.error(`ERROR: ${message}`);
for (const message of warnings) console.warn(`WARN: ${message}`);
if (errors.length) process.exitCode = 1;
