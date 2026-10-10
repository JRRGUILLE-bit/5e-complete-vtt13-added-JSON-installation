#!/usr/bin/env node
/**
 * Read-only pre-migration audit for 5e Complete compendium JSONL files.
 * Run from the module root: node tools/audit-compendia.mjs
 * It inventories risks; it does not prove runtime compatibility.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const packsDir = path.join(root, "packs");
const manifestPath = path.join(root, "module.json");
const errors = [];
const warningCounts = new Map();
const warningSamples = new Map();
const recordsByPack = new Map();
const recordIdsByPack = new Map();
const internalReferences = [];
const packIds = new Set();
const systemVersions = new Map();
const coreVersions = new Map();
let scannedLinks = 0;

function warn(category, message) {
  warningCounts.set(category, (warningCounts.get(category) ?? 0) + 1);
  const samples = warningSamples.get(category) ?? [];
  if (samples.length < 5) samples.push(message);
  warningSamples.set(category, samples);
}
function countVersion(map, version) { if (version) map.set(version, (map.get(version) ?? 0) + 1); }

try {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const pack of manifest.packs ?? []) packIds.add(pack.name);
  console.log(`Manifest module id: ${manifest.id}`);
  console.log(`Declared compendium packs: ${packIds.size}`);
  console.log(`Declared Foundry compatibility: minimum=${manifest.compatibility?.minimum ?? "?"}, verified=${manifest.compatibility?.verified ?? "?"}, maximum=${manifest.compatibility?.maximum ?? "?"}`);
  const files = (await readdir(packsDir)).filter((name) => name.endsWith(".db")).sort();
  if (!files.length) errors.push("No .db compendium files found in packs/.");

  for (const file of files) {
    const text = await readFile(path.join(packsDir, file), "utf8");
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
    const idCounts = new Map();
    const ids = new Set();
    let parsed = 0;
    for (let i = 0; i < lines.length; i++) {
      let doc;
      try { doc = JSON.parse(lines[i]); parsed++; }
      catch (error) { errors.push(`${file}:${i + 1}: invalid JSONL record (${error.message})`); continue; }
      if (!doc || typeof doc !== "object" || Array.isArray(doc)) { errors.push(`${file}:${i + 1}: record is not a JSON object.`); continue; }
      if (typeof doc._id !== "string" || !doc._id) errors.push(`${file}:${i + 1}: missing string _id.`);
      else { idCounts.set(doc._id, (idCounts.get(doc._id) ?? 0) + 1); ids.add(doc._id); }
      if (doc.data && !doc.system) warn("legacy-data-field", `${file}:${i + 1}: has top-level data without system; requires migration review.`);
      countVersion(systemVersions, doc._stats?.systemVersion);
      countVersion(coreVersions, doc._stats?.coreVersion);
      const strings = [];
      const visit = (value, key = "") => {
        if (typeof value === "string") { if (["value", "description", "origin", "content", "text", "command"].includes(key)) strings.push(value); return; }
        if (Array.isArray(value)) { for (const item of value) visit(item, key); return; }
        if (value && typeof value === "object") { for (const [childKey, childValue] of Object.entries(value)) { if (childKey === "sourceId" || childKey === "_stats") continue; visit(childValue, childKey); } }
      };
      visit(doc);
      for (const value of strings) {
        const patterns = [/@Compendium\[([^\].]+)\.([^\].]+)\.([^\]]+)\]/g, /@UUID\[Compendium\.([^\.\]]+)\.([^\.\]]+)\.([^\]]+)\]/g];
        for (const pattern of patterns) for (const match of value.matchAll(pattern)) {
          scannedLinks++;
          const namespace = match[1], pack = match[2];
          if (namespace === manifest.id || namespace === "5e-complete") {
            internalReferences.push({ file, line: i + 1, namespace, pack, id: match[3] });
            if (namespace === "5e-complete") warn("legacy-module-namespace", `${file}:${i + 1}: internal link still uses old module id "5e-complete".`);
          }
        }
      }
    }
    for (const [id, count] of idCounts) if (count > 1) errors.push(`${file}: _id "${id}" occurs ${count} times; compendium IDs must be unique.`);
    const packName = file.replace(/\.db$/, "");
    recordsByPack.set(packName, parsed);
    recordIdsByPack.set(packName, ids);
    if (lines.length !== parsed) errors.push(`${file}: parsed ${parsed}/${lines.length} non-empty lines.`);
  }
  for (const ref of internalReferences) {
    if (!packIds.has(ref.pack)) {
      const candidates = [...recordIdsByPack].filter(([, ids]) => ids.has(ref.id)).map(([name]) => name);
      const hint = candidates.length ? ` ID exists in pack(s): ${candidates.join(", ")}.` : " Target ID was not found in any scanned pack.";
      warn("undeclared-internal-pack-reference", `${ref.file}:${ref.line}: internal link targets undeclared pack "${ref.pack}" (${ref.namespace}.${ref.pack}.${ref.id}).${hint}`);
    } else if (!recordIdsByPack.get(ref.pack)?.has(ref.id)) {
      warn("missing-internal-document-reference", `${ref.file}:${ref.line}: target ID "${ref.id}" not found in declared pack "${ref.pack}".`);
    }
  }
} catch (error) { console.error(`Audit could not complete: ${error.message}`); process.exit(2); }

console.log("\nCompendium record counts:");
for (const [name, count] of recordsByPack) console.log(`  ${name}: ${count} records`);
console.log("\nEmbedded source-version counts:");
console.log("  dnd5e: " + ([...systemVersions].map(([v, n]) => `${v} (${n})`).join(", ") || "not recorded"));
console.log("  Foundry: " + ([...coreVersions].map(([v, n]) => `${v} (${n})`).join(", ") || "not recorded"));
console.log(`\nCompendium links scanned: ${scannedLinks}`);
console.log(`Errors: ${errors.length}`);
for (const message of errors) console.error(`ERROR: ${message}`);
console.log(`\nWarnings by category (${[...warningCounts.values()].reduce((a, b) => a + b, 0)} total):`);
for (const [category, count] of [...warningCounts].sort((a, b) => b[1] - a[1])) {
  console.warn(`WARN ${category}: ${count}`);
  for (const sample of warningSamples.get(category) ?? []) console.warn(`  example: ${sample}`);
}
if (errors.length) process.exitCode = 1;
