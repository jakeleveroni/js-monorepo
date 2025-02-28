import { readFileSync } from "fs";
import { newDb } from "pg-mem";

export function mockDatabasePool() {
  const db = newDb();
  const schema = readSchema();
  if (!schema) {
    return;
  }

  try {
    console.log("Applying schema", schema);
    db.public.none(schema);
  } catch {
    console.error("Unable to apply schema");
  }

  const mockPool = db.adapters.createPg().Pool;
  console.log(mockPool);
  return mockPool;
}

function readSchema() {
  try {
    // bun module mocking needs synchronous functions
    return readFileSync("../../../database/init/schema.sql").toString("utf-8");
  } catch (err) {
    console.error("Unable to read schema file for db initialization.", err);
    return undefined;
  }
}
