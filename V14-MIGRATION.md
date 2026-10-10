# Foundry V14 / dnd5e compatibility audit

Target core: Foundry VTT Version 14 Stable Build 369 (14.369), released 2026-10-08. The official Foundry package listing currently shows dnd5e 6.0.5 as available, requiring Foundry 14.367+. Confirm the exact system version in the user's installation before release.

This branch is an adaptation workspace, not a claim that the module is compatible. Do not install it into the live campaign until runtime validation passes.

## Changes made in this branch

- Added a read-only JSONL audit and GitHub Actions workflow.
- Removed nine redundant copies of `Shield Master` from `packs/5e-feats.db`, retaining the most complete version. The initial audit found ten records sharing one `_id`; after cleanup, the pack has 83 records and no duplicate IDs.
- Registered the existing `5e-journals.db` pack in `module.json` as a JournalEntry compendium and added it to the pack-folder layout.
- Repaired 6,113 internal compendium references across 11 packs, replacing the old module namespace `5e-complete` with the module's actual manifest ID `completecompendium`. The original `main` branch was not modified.

## Findings still requiring attention

- The source manifest still declares compatibility only through Foundry V13 (`verified: 13.350`, `maximum: 13`). It must not be marked compatible with V14 until runtime validation passes.
- The data is mixed-generation: 1,146 records have recorded dnd5e source version 2.0.3, and 1,146 records have recorded Foundry 10.x source versions. The audit also found 3,821 documents with a top-level legacy `data` field but no `system` field. These need migration validation, not a blind global rename.
- One internal link still targets undeclared pack `5e-monster-features` (`completecompendium.5e-monster-features.eP7u8wEbpkq4p8Os`). Resolve the intended target before release; do not silently redirect it.
- JSON parse and ID validation do not prove that actors, items, activities, effects, advancements, macros, journal links, or automation work in dnd5e 6.x.

## Validation performed

- Automated read-only audit scanned all 16 declared packs and parsed every non-empty JSONL record.
- After the duplicate cleanup, the audit reported zero JSON/ID errors.
- The post-repair audit reported zero remaining `5e-complete` namespace references and one unresolved internal pack reference.
- A disposable Foundry V14 world has not yet been used for runtime testing. That remains a release blocker.

## Release gates

1. Resolve the `5e-monster-features` reference and verify every internal UUID target.
2. Test all packs in a disposable Foundry 14.369 world with the exact installed dnd5e version.
3. Inspect legacy `data` documents after Foundry/dnd5e migration, especially item activities, effects, advancement data, actors, and macros.
4. Confirm that representative content opens and works, not merely that it parses.
5. Only after runtime validation, update compatibility metadata and publish an install URL for this branch or a tagged release.
6. Do not merge into `main` or overwrite the original module until the user explicitly authorizes it.
