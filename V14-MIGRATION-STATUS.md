# V14 migration audit

Target: Foundry VTT V14 Build 369, D&D 5e system 6.0.6, legacy 2014-rules compendium.

## Changes made on branch `v14-migration`

- Added a separate module ID, `5e-complete-v14`, so it does not collide with the upstream `completecompendium` module.
- Set the manifest compatibility target to Foundry V14 as an experimental target.
- Added a branch archive URL to the manifest so Foundry can fetch this branch for a test installation.
- Registered `packs/5e-journals.db`, which existed in the repository but was not declared in the manifest, as a JournalEntry pack.
- Updated internal compendium references to the new module ID in the backgrounds, classes, feats, races, racial features, subclasses, journals, and roll-table packs.
- Normalized legacy RollTable result reference keys in the roll-table pack (`collection/resultId` to `documentCollection/documentId`) and removed redundant `rangeL/rangeH` fields.
- Reworked the Rage and Toggle Rage macros to use modern ActiveEffect properties and embedded-document updates.
- Reworked the Healing Potion macro to use `item.system` data and modern item use calls.
- Added an idempotent local migration script for all pack databases, including the large creature pack that cannot reliably be rewritten through the GitHub file API.
- Added a static pack validator and a GitHub Actions workflow that runs the migration and then checks manifest paths, NDJSON parsing, legacy root/embedded-item fields, and old module references.
- Added this audit so remaining issues and test limits are explicit.

## Still unverified — do not call this a finished migration yet

### Pack document schema

The migration script converts legacy root and embedded-item `data` fields to `system`, and old `permission` metadata to `ownership`, when a modern equivalent is not already present. This is a conservative structural pass, not a complete schema conversion. D&D 5e 6.0.6 may require type-specific field migrations that static checks cannot infer; the large creature pack especially still needs runtime import tests.

### More macros

Other macros, including Divine Smite, Lay on Hands, and Portent, still need review and testing against the current D&D 5e API. They were not rewritten speculatively because changing resource spending or damage logic without a live test could silently break their behavior.

### References and content

Some records refer to core/system compendiums and external images that may have changed or may not exist in the user's installation. Some entries are incomplete in the upstream project. Pack links need a runtime validation pass after the module loads.

## Static preparation and validation

Run `node scripts/migrate-v14-pack-data.js` and then `node scripts/validate-v14-packs.js` from a checkout of this branch. The GitHub Actions workflow does the same in a clean runner. The migration script is idempotent and edits pack files in place, so keep the original checkout or ZIP as a backup.

Passing static validation does not prove the documents can be imported or that macros work in Foundry V14.

## Required runtime test pass

1. Back up the Foundry data directory/world first.
2. Install this branch only in a disposable test world or separate Foundry data directory.
3. Confirm all declared packs are listed and can be opened.
4. Import representative actors, items, spells, classes, subclasses, roll tables, and journal entries.
5. Record the exact browser-console errors and failed document names.
6. Fix reproducible failures in small commits and repeat the tests.

Static inspection cannot certify runtime compatibility. The manifest's V14 compatibility fields indicate the target, not a successful test.

## Content and licensing

This project inherits content and history from upstream 5e Complete. Respect original authors' notices and applicable licenses. Only use content you are legally entitled to use; do not redistribute non-SRD copyrighted book content without permission. This is not an official Foundry or Wizards of the Coast product.

## Upstream

- https://github.com/mikkelhaas/5e-complete-vtt13-added-JSON-installation
- https://github.com/Archer39/5e-complete
