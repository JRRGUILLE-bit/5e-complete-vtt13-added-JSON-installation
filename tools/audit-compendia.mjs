#!/usr/bin/env node
/**
 * Read-only pre-migration audit for 5e Complete compendium JSONL files.
 * Run from the module root: node tools/audit-compendia.mjs
 * This does not rewrite data or prove runtime compatibility.
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
const systemVersions = new Map();
const coreVersions = new Map();

function report(level, message) {
  (level === "ERROR" ? errors : warnings).push(message);
}

try {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const pack of manifest.packs ?? []) packIds.add(pack.name);
  console.log(`Manifest module id: ${manifest.id}`);
  console.log(`Declared compendium packs: ${packIds.size}`);
  console.log(`Declared Foundry compatibility: minimum=${manifest.compatibility?.minimum ?? "?"}, verified=${manifest.compatibility?.verified ?? "?"}, maximum=${manifest.compatibility?.maximum ?? "?"}`);

  const files = (await readdir(packsDir)).filter((name) => name.endsWith(".db")).sort();
  if (!files.length) report("ERROR", "No .db compendium files found in packs/.");

  for (const file of files) {
    const text = await readFile(path.join(packsDir, file), "utf8");
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
      if (typeof doc._id !== "string" || !doc._id) report("ERROR", `${file}:${i + 1}: missing string _id.`);
      else if (seenIds.has(doc._id)) report("ERROR", `${file}:${i + 1}: duplicate _id ${doc._id}.`);
      else seenIds.add(doc._id);

      const sysVer = doc._stats?.systemVersion;
      const coreVer = doc._stats?.coreVersion;
      if (sysVer) systemVersions.set(sysVer, (systemVersions.get(sysVer) ?? 0) + 1);
      if (coreVer) coreVersions.set(coreVer, (coreVersions.get(coreVer) ?? 0) + 1);
      if (doc.data && !doc.system) report("WARN", `${file}:${i + 1}: legacy-looking data field without system; inspect against dnd5e 6.x schema.`);

      const serialized = JSON.stringify(doc);
      const re = /@Compendium\[([^\].]+)\.([^\].]+)\.([^\]]+)\]/g;
      for (const match of serialized.matchAll(re)) refs.push({ file, line: i + 1, namespace: match[1], pack: match[2], id: match[3] });
    }
    recordsByPack.set(file.replace(/\.db$/, ""), parsed);
    if (lines.length !== parsed) report("ERROR", `${file}: parsed ${parsed}/${lines.length} non-empty lines.`);
  }

  console.log("\nCompendium record counts:");
  for (const [name, count] of recordsByPack) console.log(`  ${name}: ${count} records`);
  console.log("\nEmbedded source-version counts:");
  console.log("  dnd5e: " + ([...systemVersions].map(([v, n]) => `${v} (${n})`).join(", ") || "not recorded"));
  console.log("  Foundry: " + ([...coreVersions].map(([v, n]) => `${v} (${n})`).join(", ") || "not recorded"));

  for (const ref of refs) {
    if (!packIds.has(ref.pack)) report("WARN", `${ref.file}:${ref.line}: reference targets undeclared pack "${ref.pack}" (${ref.namespace}.${ref.pack}.${ref.id}); verify target before changing it.`);
    if (ref.namespace !== manifest.id) report("WARN", `${ref.file}:${ref.line}: reference namespace "${ref.namespace}" differs from module id "${manifest.id}"; resolve target before rewriting.`);
  }
  console.log(`\nCompendium links scanned: ${refs.length}`);
} catch (error) {
  console.error(`Audit could not complete: ${error.message}`);
  process.exit(2);
}

console.log(`\nResult: ${errors.length} error(s), ${warnings.length} warning(s).`);
for (const message of errors) console.error(`ERROR: ${message}`);
for (const message of warnings) console.warn(`WARN: ${message}`);
if (errors.length) process.exitCode = 1;
