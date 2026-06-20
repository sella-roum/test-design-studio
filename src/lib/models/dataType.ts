import type { EntityBase } from '../types';

export type BaseType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'object';

export type DataTypeConstraints = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  enumValues?: string[];
};

export type DataType = EntityBase & {
  name: string;
  baseType: BaseType;
  description?: string;
  constraints?: DataTypeConstraints;
  validExamples?: string[];
  invalidExamples?: string[];
};
