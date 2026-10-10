# Foundry V14 / dnd5e 6.0.6 adaptation

Target environment: Foundry VTT V14 Stable Build 369 with dnd5e 6.0.6.

This branch is an adaptation workspace, not a claim that the module is already compatible. Do not install it into the live campaign until the migration checks pass.

## Current findings

- The source manifest (`module.json`) declares Foundry compatibility through V13 only.
- The compendiums are line-delimited JSON records stored in `packs/*.db`.
- Compendium content contains references using the `5e-complete` namespace, while the manifest's module id is `completecompendium`. This mismatch needs to be resolved deliberately; changing the id alone can break installed-module identity, so it must be tested alongside internal references.
- The pack records use `system` data in the sample inspected, but that does not establish full compatibility with dnd5e 6.x. Every document type and its embedded activities/effects must be checked against the target system.
- The source data includes references to `5e-journals`; the target module manifest does not declare that pack. These links may be stale or refer to a companion pack and need inventory before deciding whether to rewrite them.

## First validation pass

From a local clone of this branch, run:

```bash
node tools/audit-compendia.mjs
```

The script is read-only. It checks JSONL parseability, missing/duplicate document IDs, legacy-looking data fields, pack references, and namespace mismatches. Treat its output as an inventory, not proof of runtime compatibility.

## Required before release

1. Preserve the original V13 branch and packs unchanged.
2. Validate every pack in a disposable Foundry V14 world using dnd5e 6.0.6.
3. Confirm pack registration and document types, then test representative actors/items/spells/features/creatures/macros/tables.
4. Audit compendium UUIDs and cross-pack references, including any `5e-journals` references.
5. Check rules automation and document fields against dnd5e 6.x; don't assume old data migrates correctly just because JSON parses.
6. Only after the above, update compatibility metadata and provide an install URL for this branch or a tagged release.
7. Do not merge into `main` or overwrite the original module until the user explicitly authorizes it.
