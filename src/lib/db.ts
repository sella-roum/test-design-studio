import Dexie, { type Table } from 'dexie';
import { DB_NAME, SCHEMA_VERSION } from './constants';
import type { Project } from './models/project';
import type { Feature } from './models/feature';
import type { Screen } from './models/screen';
import type { UiNode } from './models/uiNode';
import type { DataEntity } from './models/dataEntity';
import type { DataField } from './models/dataField';
import type { DataType } from './models/dataType';
import type { BusinessRule } from './models/businessRule';
import type { TestViewpoint } from './models/testViewpoint';
import type { TestCase } from './models/testCase';
import type { OpenQuestion } from './models/openQuestion';
import type { TraceLink } from './models/traceLink';
import type { ChangeRecord } from './models/changeRecord';

export class AppDatabase extends Dexie {
  projects!: Table<Project, string>;
  features!: Table<Feature, string>;
  screens!: Table<Screen, string>;
  uiNodes!: Table<UiNode, string>;
  dataEntities!: Table<DataEntity, string>;
  dataFields!: Table<DataField, string>;
  dataTypes!: Table<DataType, string>;
  businessRules!: Table<BusinessRule, string>;
  testViewpoints!: Table<TestViewpoint, string>;
  testCases!: Table<TestCase, string>;
  openQuestions!: Table<OpenQuestion, string>;
  traceLinks!: Table<TraceLink, string>;
  changeRecords!: Table<ChangeRecord, string>;

  constructor(name: string = DB_NAME) {
    super(name);
    this.version(1).stores({});
    this.version(2).stores({
      projects: 'id, status, updatedAt',
    });
    this.version(3).stores({
      projects: 'id, status, updatedAt',
      features: 'id, projectId, [projectId+status], updatedAt',
      screens: 'id, projectId, featureId, [featureId+status], updatedAt',
    });
    this.version(4).stores({
      projects: 'id, status, updatedAt',
      features: 'id, projectId, [projectId+status], updatedAt',
      screens: 'id, projectId, featureId, [featureId+status], updatedAt',
      uiNodes: 'id, projectId, screenId, parentId, [screenId+status], sortOrder',
    });
    this.version(5).stores({
      projects: 'id, status, updatedAt',
      features: 'id, projectId, [projectId+status], updatedAt',
      screens: 'id, projectId, featureId, [featureId+status], updatedAt',
      uiNodes: 'id, projectId, screenId, parentId, [screenId+status], sortOrder',
      dataEntities: 'id, projectId, [projectId+status]',
      dataFields: 'id, projectId, entityId, dataTypeId',
      dataTypes: 'id, projectId, [projectId+status]',
    });
    this.version(6).stores({
      projects: 'id, status, updatedAt',
      features: 'id, projectId, [projectId+status], updatedAt',
      screens: 'id, projectId, featureId, [featureId+status], updatedAt',
      uiNodes: 'id, projectId, screenId, parentId, [screenId+status], sortOrder',
      dataEntities: 'id, projectId, [projectId+status]',
      dataFields: 'id, projectId, entityId, dataTypeId',
      dataTypes: 'id, projectId, [projectId+status]',
      businessRules: 'id, projectId, featureId, screenId, uiNodeId, [projectId+status]',
      testViewpoints: 'id, projectId, featureId, [projectId+status], [featureId+status]',
      testCases: 'id, projectId, featureId, viewpointId, [projectId+status], [featureId+status]',
    });
    this.version(SCHEMA_VERSION).stores({
      projects: 'id, status, updatedAt',
      features: 'id, projectId, [projectId+status], updatedAt',
      screens: 'id, projectId, featureId, [featureId+status], updatedAt',
      uiNodes: 'id, projectId, screenId, parentId, [screenId+status], sortOrder',
      dataEntities: 'id, projectId, [projectId+status]',
      dataFields: 'id, projectId, entityId, dataTypeId',
      dataTypes: 'id, projectId, [projectId+status]',
      businessRules: 'id, projectId, featureId, screenId, uiNodeId, [projectId+status]',
      testViewpoints: 'id, projectId, featureId, [projectId+status], [featureId+status]',
      testCases: 'id, projectId, featureId, viewpointId, [projectId+status], [featureId+status]',
      openQuestions:
        'id, projectId, featureId, screenId, uiNodeId, questionStatus, [projectId+status]',
      traceLinks:
        'id, projectId, fromId, toId, [fromType+fromId], [toType+toId], linkType, [projectId+status]',
      changeRecords:
        'id, projectId, targetId, [targetType+targetId], changeType, [projectId+status], updatedAt',
    });
  }
}

export function createDb(name?: string): AppDatabase {
  return new AppDatabase(name);
}

export const db = new AppDatabase();
