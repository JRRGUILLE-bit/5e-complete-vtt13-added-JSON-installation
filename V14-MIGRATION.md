# Foundry V14 / dnd5e 6.0.6 adaptation

Target checked against the official version pages on 2026-10-10: Foundry VTT Version 14 Stable Build 369 (release 14.369) and dnd5e 6.0.6. The official dnd5e package listing identifies 6.0.6 as the current release and requires Foundry 14.367 or newer. This satisfies the user's installed core version.

This branch is an adaptation workspace, not a claim that the module is already compatible. Do not install it into the live campaign until the migration checks pass.

## Current findings

- The source manifest (`module.json`) declares compatibility through Foundry V13 (`verified: 13.350`, `maximum: 13`). It must not be marked compatible with V14 until runtime validation passes.
- The compendiums are line-delimited JSON records stored in `packs/*.db`.
- The sample records contain `_stats.systemVersion: 2.0.3` and `_stats.coreVersion: 10.286`. This is strong evidence that the content originated on an old dnd5e / Foundry generation. The current system may migrate many documents, but it does not prove that every document, activity, effect, macro, and cross-reference works.
- Some descriptions contain references in the `5e-complete` namespace while the module id in `module.json` is `completecompendium`. Treat these as references requiring validation, not as proof of a broken link: the namespace may be legacy or refer to a different package. Do not globally replace it without resolving targets.
- The manifest does not declare a `5e-journals` pack, while some content appears to reference it. Determine whether those are valid external/legacy links, missing companion content, or stale references before changing them.
- Current dnd5e release notes include migrations and fixes for legacy data, but migration behavior needs to be tested with this specific module's content in a disposable world.

## First validation pass

From a local clone of this branch, run:

```bash
node tools/audit-compendia.mjs
```

The script is read-only. It checks JSONL parseability, missing/duplicate document IDs, old system/core versions, and compendium reference namespaces/packs. It is an inventory, not proof of runtime compatibility.

## Required before release

1. Preserve the original branch and packs unchanged.
2. Run the audit against every pack and review every warning; distinguish true broken links from legacy references.
3. Validate every pack in a disposable Foundry V14.369 world using dnd5e 6.0.6.
4. Confirm pack registration and document types, then test representative actors, items, spells, features, creatures, macros, and roll tables.
5. Audit compendium UUIDs and cross-pack references, including `5e-journals` references and old `5e-complete` namespace links.
6. Check rules automation and document fields against dnd5e 6.0.6. Do not assume old data migrates correctly just because JSON parses.
7. Only after runtime validation, update compatibility metadata and publish an install URL for this branch or a tagged release.
8. Do not merge into `main` or overwrite the original module until the user explicitly authorizes it.
