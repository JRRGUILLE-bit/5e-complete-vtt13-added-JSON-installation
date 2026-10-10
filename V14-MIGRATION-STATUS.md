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
- Added this audit so remaining issues and test limits are explicit.

## Still unverified — do not call this a finished migration yet

### Pack document schema

Many pack entries still use legacy `data`-shaped document fields. Foundry may migrate some old source data, but it is not safe to assume every compendium document will be accepted correctly by Foundry V14 and D&D 5e 6.0.6. The larger class-feature, item, spell, and creature packs need full inspection and test imports.

### More macros

Other macros, including Divine Smite, Lay on Hands, and Portent, still need review and testing against the current D&D 5e API. They were not rewritten speculatively because changing resource spending or damage logic without a live test could silently break their behavior.

### References and content

Some records refer to core/system compendiums and external images that may have changed or may not exist in the user's installation. Some entries are incomplete in the upstream project. Pack links need a runtime validation pass after the module loads.

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
