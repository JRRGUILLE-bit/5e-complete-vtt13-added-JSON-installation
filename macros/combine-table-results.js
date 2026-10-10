// Foundry V14 / D&D 5e 6.x
// Roll one result from each of three RollTables in the current world.
// Rename these table names to match the RollTables in your world.

const tableNames = [
  "table with adjectives",
  "table with nouns",
  "table with weapon names"
];

async function rollText(tableName) {
  const table = game.tables.getName(tableName);
  if (!table) throw new Error(`Could not find RollTable "${tableName}".`);
  const result = await table.roll();
  const row = result.results?.[0];
  if (!row) throw new Error(`RollTable "${tableName}" returned no result.`);
  return row.text ?? row.name ?? "";
}

try {
  const [adjective, noun, weapon] = await Promise.all(tableNames.map(rollText));
  const content = `You see a ${adjective} ${noun} wielding a ${weapon}.`;
  await ChatMessage.create({ content });
} catch (error) {
  console.error("Combine Table Results macro failed:", error);
  ui.notifications.error(error.message ?? "Could not combine RollTable results.");
}

// For a compendium table, resolve the pack and document first, for example:
// const pack = game.packs.get("module-name.pack-name");
// const table = await pack?.getDocument("table-document-id");
// Then use table.roll() the same way as above.
