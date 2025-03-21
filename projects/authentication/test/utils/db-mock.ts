import { mock } from 'bun:test';
import { readFileSync } from 'fs';
import { newDb } from 'pg-mem';

mock.module('pg', () => {
  const db = newDb();
  const schema = readSchema();
  if (!schema) {
    return;
  }

  try {
    console.log('Applying schema', schema);
    db.public.none(schema);
  } catch (err) {
    console.error('Unable to apply schema', err);
  }

  const mockPool = db.adapters.createPg().Pool;
  return { Client: mock(), Pool: mockPool };
});

function readSchema() {
  try {
    // bun module mocking needs synchronous functions
    return readFileSync(__dirname + '/../../../database/init/pgmem-schema.sql').toString('utf-8');
  } catch (err) {
    console.error('Unable to read schema file for db initialization.', err);
    return undefined;
  }
}
