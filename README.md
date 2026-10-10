# 5e Complete Compendium — V14 migration (2014 rules)

This branch is an **experimental migration** of the existing 5e Complete compendium for Foundry VTT V14 and the D&D 5e system 6.x, with the goal of retaining the legacy 2014-rules content.

## Status

- Separate module ID: `5e-complete-v14` (does not overwrite `completecompendium`).
- Initial V14 manifest metadata has been added.
- **Not yet runtime-validated** against Foundry VTT V14 Build 369 and D&D 5e 6.0.6.
- Compendium databases, document schemas, links, macros, and imports still need validation. A manifest update alone does not make the data compatible.
- Keep this branch separate from any live installation and back up worlds before testing.

## Testing plan

1. Install this branch as a separate module in a disposable test world.
2. Check that all packs are detected and can be opened.
3. Inspect representative actors, items, spells, classes, subclasses, and tables.
4. Test importing documents into a test world and check the browser console for migration/schema errors.
5. Fix pack data and macros based on reproducible errors, then retest.

## Content and licensing

This project inherits content and history from upstream 5e Complete. Respect the original authors' notices and the applicable licenses. Only use content you are legally entitled to use; do not redistribute non-SRD copyrighted book content without permission. Some entries may be incomplete or reference images unavailable locally.

## Upstream

- Original continuation: https://github.com/mikkelhaas/5e-complete-vtt13-added-JSON-installation
- Original project: https://github.com/Archer39/5e-complete

This is a community compatibility effort, not an official Foundry or Wizards of the Coast product.
