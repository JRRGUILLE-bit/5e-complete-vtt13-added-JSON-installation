# Foundry V14 / dnd5e compatibility audit

Target core: Foundry VTT Version 14 Stable Build 369 (14.369), released 2026-10-08. The official Foundry package listing currently shows dnd5e 6.0.5 as available, requiring Foundry 14.367+. Do not assume a later version is installed unless the user's Foundry system screen confirms it.

This branch is an adaptation workspace, not a claim that the module is compatible. Do not install it into the live campaign until validation passes.

## Current findings

- The source manifest (`module.json`) declares compatibility through Foundry V13 (`verified: 13.350`, `maximum: 13`). It must not be marked compatible with V14 until runtime validation passes.
- The compendiums are line-delimited JSON records stored in `packs/*.db`.
- Sample records contain `_stats.systemVersion: 2.0.3` and `_stats.coreVersion: 10.286`, indicating the content was saved on an older generation of dnd5e and Foundry.
- Some descriptions contain `5e-complete` compendium references although the manifest id is `completecompendium`. This is a mismatch to investigate, not proof by itself that the references are broken. Resolve the targets before rewriting anything.
- Some content appears to reference `5e-journals`, which is not declared as a pack in the manifest. Determine whether these are external/legacy links or missing content before editing.
- The dnd5e 6.0 system generation includes substantial document/activity/effect changes. Successful JSON parsing alone cannot establish that old data works correctly in V14.

## Automated inventory

Run locally from the module root with Node.js 20 or newer:

```bash
node tools/audit-compendia.mjs
```

A GitHub Actions workflow is configured to run this read-only audit on relevant changes and upload the text report as an artifact. The workflow must complete successfully before its results can be assessed.

The audit checks JSONL parseability, missing/duplicate IDs, recorded source versions, and legacy compendium link namespaces/packs. It is an inventory, not proof of runtime compatibility.

## Required before release

1. Preserve the original source branch and packs unchanged.
2. Run the automated audit and review each warning, especially references to `5e-complete` and `5e-journals`.
3. Validate all packs in a disposable Foundry 14.369 world with the exact dnd5e version actually installed (official package listing currently shows 6.0.5).
4. Confirm pack registration and document types, then test representative actors, items, spells, features, creatures, macros, and roll tables.
5. Check dnd5e document schemas, activities, Active Effects, advancement data, macros, and cross-pack UUIDs.
6. Only after runtime validation, update compatibility metadata and publish an install URL for the adaptation branch or a tagged release.
7. Do not merge into `main` or overwrite the original module until the user explicitly authorizes it.
