#!/usr/bin/env node
/**
 * Targeted repair for internal compendium UUIDs left under the old module id
 * and one stale pack name confirmed by the read-only audit.
 * Default is dry-run; pass --apply to modify packs/*.db in place.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const apply = process.argv.includes("--apply");
const packsDir = path.join(process.cwd(), "packs");
const files = (await readdir(packsDir)).filter((name) => name.endsWith(".db")).sort();
const namespacePattern = /(@Compendium\[|Compendium\.)5e-complete\./g;
const stalePackPattern = /completecompendium\.5e-monster-features\.eP7u8wEbpkq4p8Os/g;
let filesChanged = 0;
let refsChanged = 0;
for (const file of files) {
  const fullPath = path.join(packsDir, file);
  const original = await readFile(fullPath, "utf8");
  let count = 0;
  let updated = original.replace(namespacePattern, (match, prefix) => { count++; return `${prefix}completecompendium.`; });
  updated = updated.replace(stalePackPattern, () => { count++; return "completecompendium.5e-creature-abilities.eP7u8wEbpkq4p8Os"; });
  if (count) {
    filesChanged++;
    refsChanged += count;
    console.log(`${apply ? "FIX" : "WOULD FIX"} ${file}: ${count} reference(s)`);
    if (apply) await writeFile(fullPath, updated, "utf8");
  }
}
console.log(`${apply ? "Updated" : "Would update"} ${refsChanged} reference(s) across ${filesChanged} compendium file(s).`);
if (!apply) console.log("Dry run only. Re-run with --apply to write changes.");
