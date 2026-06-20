import { describe, it, expect, afterAll } from 'vitest';
import { AppDatabase, createDb } from '../db';
import { DB_NAME, SCHEMA_VERSION } from '../constants';

const TEST_DB_NAME = 'test-design-studio-db-test';

describe('AppDatabase', () => {
  let testDb: AppDatabase;

  afterAll(async () => {
    if (testDb?.isOpen()) {
      await testDb.delete();
    }
  });

  it('creates Dexie instance with default name', () => {
    testDb = new AppDatabase();
    expect(testDb.name).toBe(DB_NAME);
  });

  it('creates Dexie instance with custom name', () => {
    const custom = new AppDatabase(TEST_DB_NAME);
    expect(custom.name).toBe(TEST_DB_NAME);
    custom.delete();
  });

  it('creates database via createDb helper', () => {
    const db = createDb(TEST_DB_NAME);
    expect(db).toBeInstanceOf(AppDatabase);
    expect(db.name).toBe(TEST_DB_NAME);
    db.delete();
  });

  it('defines all Foundation Phase tables', () => {
    const db = new AppDatabase(TEST_DB_NAME);
    const requiredTables = [
      'projects',
      'features',
      'screens',
      'uiNodes',
      'dataEntities',
      'dataFields',
      'dataTypes',
      'businessRules',
      'testViewpoints',
      'testCases',
      'openQuestions',
      'traceLinks',
      'changeRecords',
    ];
    const tableNames = db.tables.map((table) => table.name);
    expect(tableNames).toEqual(expect.arrayContaining(requiredTables));
    db.close();
  });
});

describe('Database constants', () => {
  it('has string DB_NAME', () => {
    expect(DB_NAME).toBe('test-design-studio');
    expect(typeof DB_NAME).toBe('string');
  });

  it('has numeric SCHEMA_VERSION', () => {
    expect(SCHEMA_VERSION).toBe(7);
    expect(typeof SCHEMA_VERSION).toBe('number');
  });
});

describe('Database lifecycle', () => {
  let lifecycleDb: AppDatabase;

  afterAll(async () => {
    if (lifecycleDb?.isOpen()) {
      await lifecycleDb.delete();
    }
  });

  it('opens database successfully', async () => {
    lifecycleDb = new AppDatabase(TEST_DB_NAME);
    await lifecycleDb.open();
    expect(lifecycleDb.isOpen()).toBe(true);
  });

  it('closes database successfully', async () => {
    await lifecycleDb.close();
    expect(lifecycleDb.isOpen()).toBe(false);
  });

  it('reopens after close', async () => {
    await lifecycleDb.open();
    expect(lifecycleDb.isOpen()).toBe(true);
  });
});
