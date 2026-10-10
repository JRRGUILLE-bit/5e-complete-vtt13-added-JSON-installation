# 5e Complete Compendium — V14 migration (2014 rules)

This branch is an **experimental migration** of the existing 5e Complete compendium for Foundry VTT V14 and the D&D 5e system 6.x, with the goal of retaining the legacy 2014-rules content.

## Status

- Separate module ID: `5e-complete-v14` (does not overwrite `completecompendium`).
- Initial V14 manifest metadata has been added.
- **Not yet runtime-validated** against Foundry VTT V14 Build 369 and D&D 5e 6.0.6.
- Several pack databases now have structural migrations committed (legacy `data` → `system`, `permission` → `ownership`, and internal module-reference updates). The large creature pack still requires the local migration pass below.
- This is still **not runtime-validated**: D&D 5e 6.0.6 document schemas and macro behavior must be tested in Foundry itself.
- Keep this branch separate from any live installation and back up worlds before testing.

## Download the prepared V14 build

The GitHub Actions workflow runs the structural migration against every pack (including the large creature database), validates the resulting pack files, and publishes a ZIP artifact named `5e-complete-v14-prepared`.

To get it, open the [V14 validation workflow runs](https://github.com/JRRGUILLE-bit/5e-complete-vtt13-added-JSON-installation/actions/workflows/validate-v14.yml), open the latest successful run, and download the artifact from the **Artifacts** section. GitHub keeps these artifacts for 14 days, so use the latest successful run.

This archive is structurally prepared, not yet runtime-certified. Test it in a separate Foundry data directory/world, never over the live campaign.

## Prepare and test

From a checkout of this branch, run:

```sh
node scripts/migrate-v14-pack-data.js
node scripts/validate-v14-packs.js
```

The migration script is idempotent and performs only structural changes that can be inferred safely from legacy documents. It does not rewrite game rules or guarantee that every field matches the current D&D 5e schema. Keep the original checkout/ZIP as a backup because the script updates `.db` files in place.

Then:

1. Install the prepared copy in a disposable Foundry V14 test data directory/world.
2. Check that all packs are detected and can be opened.
3. Inspect representative actors, items, spells, classes, subclasses, roll tables, and journals.
4. Import documents into the test world; check the browser console for schema, UUID, and migration errors.
5. Exercise macros individually. Do not assume a macro works merely because it appears in the pack.
6. Fix reproducible runtime errors and repeat the test pass before using this in a live world.

## Content and licensing

This project inherits content and history from upstream 5e Complete. Respect the original authors' notices and the applicable licenses. Only use content you are legally entitled to use; do not redistribute non-SRD copyrighted book content without permission. Some entries may be incomplete or reference images unavailable locally.

## Upstream

- Original continuation: https://github.com/mikkelhaas/5e-complete-vtt13-added-JSON-installation
- Original project: https://github.com/Archer39/5e-complete

This is a community compatibility effort, not an official Foundry or Wizards of the Coast product.
