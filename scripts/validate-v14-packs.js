#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "module.json"), "utf8"));
let errors = 0;
let docs = 0;
let legacyData = 0;
let legacyPermission = 0;
let badReferences = 0;

for (const pack of manifest.packs ?? []) {
  const full = path.join(root, pack.path);
  if (!fs.existsSync(full)) {
    console.error(`MISSING pack: ${pack.path}`);
    errors++;
    continue;
  }
  const raw = fs.readFileSync(full, "utf8");
  for (const [index, line] of raw.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    let doc;
    try {
      doc = JSON.parse(line);
    } catch (error) {
      console.error(`INVALID JSON: ${pack.path} line ${index + 1}: ${error.message}`);
      errors++;
      continue;
    }
    docs++;
    if (doc.data && !doc.system) legacyData++;
    if (doc.permission && !doc.ownership) legacyPermission++;
    const serialized = JSON.stringify(doc);
    if (serialized.includes("5e-complete.")) badReferences++;
  }
}
console.log(JSON.stringify({
  module: manifest.id,
  target: manifest.compatibility,
  packsDeclared: manifest.packs?.length ?? 0,
  documentsChecked: docs,
  documentsWithLegacyData: legacyData,
  documentsWithLegacyPermission: legacyPermission,
  documentsWithOldModuleReferences: badReferences,
  errors
}, null, 2));
if (errors) process.exit(1);
if (legacyData || legacyPermission || badReferences) {
  console.error("Structural legacy fields/references remain. Run scripts/migrate-v14-pack-data.js and review references.");
  process.exit(2);
}
console.log("Static pack validation passed. This does not replace Foundry V14 runtime tests.");
