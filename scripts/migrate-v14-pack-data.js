#!/usr/bin/env node
/**
 * Idempotent schema preparation for legacy 5e Complete compendium packs.
 *
 * Run from the module root before installing into a disposable Foundry V14
 * test data directory: node scripts/migrate-v14-pack-data.js
 *
 * This deliberately performs only structural migrations that are safe to
 * infer from the old Foundry document shape. It does not rewrite D&D rules,
 * balance, descriptions, or macro logic.
 */
const fs = require("node:fs");
const path = require("node:path");

const packsDir = path.resolve(__dirname, "..", "packs");
if (!fs.existsSync(packsDir)) {
  console.error("Could not find packs/; run this script from the module checkout.");
  process.exit(1);
}

let totals = { files: 0, documents: 0, systemFields: 0, ownershipFields: 0, embeddedItems: 0, referencesUpdated: 0 };

function migrateDocument(doc, isEmbedded = false) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) return false;
  let changed = false;

  // Foundry V10+ document source uses system instead of the legacy data key.
  if (doc.data && typeof doc.data === "object" && !Array.isArray(doc.data) && !doc.system) {
    doc.system = doc.data;
    delete doc.data;
    totals.systemFields++;
    changed = true;
  }

  // The legacy permission field was renamed ownership. Preserve its values.
  if (doc.permission && typeof doc.permission === "object" && !doc.ownership) {
    doc.ownership = doc.permission;
    delete doc.permission;
    totals.ownershipFields++;
    changed = true;
  }

  if (Array.isArray(doc.items)) {
    for (const item of doc.items) {
      if (migrateDocument(item, true)) {
        totals.embeddedItems++;
        changed = true;
      }
    }
  }

  return changed;
}

for (const filename of fs.readdirSync(packsDir).filter(name => name.endsWith(".db"))) {
  const fullPath = path.join(packsDir, filename);
  const original = fs.readFileSync(fullPath, "utf8");
  const lines = original.split(/\r?\n/);
  const output = [];
  let fileChanged = false;

  for (const line of lines) {
    if (!line.trim()) continue;
    let doc;
    try {
      doc = JSON.parse(line);
    } catch (error) {
      console.error(`Invalid JSON in ${filename}: ${error.message}`);
      process.exitCode = 1;
      continue;
    }
    totals.documents++;
    if (migrateDocument(doc)) fileChanged = true;
    let serialized = JSON.stringify(doc);
    if (serialized.includes("5e-complete.")) {
      const updated = serialized.replaceAll("5e-complete.", "5e-complete-v14.");
      if (updated !== serialized) {
        totals.referencesUpdated += (serialized.match(/5e-complete\./g) ?? []).length;
        serialized = updated;
        fileChanged = true;
      }
    }
    output.push(serialized);
  }

  if (fileChanged) {
    fs.writeFileSync(fullPath, output.join("\n") + "\n", "utf8");
    totals.files++;
    console.log(`Migrated ${filename}`);
  }
}

console.log("\nMigration pass complete (idempotent structural changes only):");
console.log(JSON.stringify(totals, null, 2));
console.log("This is not proof of Foundry runtime compatibility; test all packs in a disposable world.");
