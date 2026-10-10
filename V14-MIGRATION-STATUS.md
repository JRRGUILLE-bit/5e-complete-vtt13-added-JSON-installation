# V14 migration audit

Target: Foundry VTT V14 Build 369, D&D 5e system 6.0.6, legacy 2014-rules compendium.

## Changes made on this branch

- Added a separate module ID, `5e-complete-v14`, to avoid colliding with the upstream module ID.
- Set the manifest compatibility target to Foundry V14 as an **experimental target**, not a claim of tested compatibility.
- Repointed module metadata at this repository and the migration branch.
- Registered `packs/5e-journals.db`, which exists in the repository but was not declared in the manifest, as a JournalEntry pack.
- Documented that the branch is not yet runtime-validated.

## Findings from inspecting existing files

### 1. Pack data is old and needs a migration pass

The compendium files are newline-delimited JSON documents. Representative records still contain legacy Foundry fields such as `permission`, `data.data`-era macro assumptions, and `_stats.systemVersion: "2.0.3"` / `_stats.coreVersion: "10.286"`. That is evidence of old source data, not proof that every record fails. The packs need to be opened and imported in a disposable V14 world to identify actual validation/migration errors.

### 2. Macros contain legacy D&D 5e APIs

Examples found in the macro compendium include:
- `i.data.label` and `i.data.disabled` for ActiveEffect properties.
- `i.data.data.consumableType` and `i.data.data.actionType` for item system fields.
- Old Roll/ChatMessage and Dialog patterns that need checking against Foundry V14.
- A Rage macro invoking `game.dnd5e.macros.rollItem` and older ActiveEffect update data.

These macros should be treated as potentially incompatible until tested. Do not assume that changing the manifest updates their API usage.

### 3. Roll table records mix schema generations

The roll-table pack contains different generations of result fields, including `collection/resultId`, `documentCollection/documentId`, and older compendium references such as `dnd5e.monsters`. References to other modules or core compendiums may be broken or point at renamed packs in the current system.

### 4. Content and testing limitations

- The pack data includes references to third-party image URLs and compendiums not guaranteed to exist.
- Some entries are explicitly incomplete in the upstream README.
- No live Foundry V14 runtime is available through this repository connector, so compatibility cannot be certified by static inspection alone.

## Next test pass

1. Install only in a disposable test world or separate Foundry data directory.
2. Confirm all declared packs appear, including Journals.
3. Open one record from each pack category and import representative documents.
4. Capture exact browser-console errors before rewriting pack data.
5. Fix reproducible failures in small commits, then retest.
