<script setup lang="ts">
import JSON5 from 'json5';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import type { UseValidationRule } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';
import { convertJsonToInsertSql } from './json-to-insert-sql.service';

const defaultTableName = 'users';
const defaultJson = `[
  { "id": 1, "name": "Alice", "active": true },
  { "id": 2, "name": "Bob", "active": false, "remark": null }
]`;

const tableName = ref(defaultTableName);
const jsonInput = ref(defaultJson);
const inputElement = ref<HTMLElement>();

const tableNameRules: UseValidationRule<string>[] = [
  {
    validator: (value: string) => value.trim().length > 0,
    message: 'Table name is required.',
  },
];

const jsonRules: UseValidationRule<string>[] = [
  {
    validator: (value: string) => value === '' || JSON5.parse(value),
    message: 'Provided JSON is not valid.',
  },
  {
    validator: (value: string) => {
      if (value === '') {
        return true;
      }

      const parsed = JSON5.parse(value);
      return Array.isArray(parsed)
        ? parsed.every(item => typeof item === 'object' && item !== null && !Array.isArray(item))
        : typeof parsed === 'object' && parsed !== null;
    },
    message: 'JSON must be an object or an array of objects.',
  },
];

const output = computed(() => withDefaultOnError(() => {
  if (jsonInput.value === '') {
    return '';
  }

  return convertJsonToInsertSql({
    tableName: tableName.value,
    input: JSON5.parse(jsonInput.value),
  });
}, ''));
</script>

<template>
  <div flex flex-col gap-4>
    <n-form-item label="Table name">
      <c-input-text
        v-model:value="tableName"
        placeholder="Enter your table name..."
        :validation-rules="tableNameRules"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        monospace
      />
    </n-form-item>

    <n-form-item label="Your JSON input">
      <c-input-text
        ref="inputElement"
        v-model:value="jsonInput"
        placeholder="Paste your JSON here..."
        :validation-rules="jsonRules"
        rows="20"
        multiline
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        monospace
      />
    </n-form-item>

    <n-form-item label="Generated INSERT SQL">
      <TextareaCopyable :value="output" language="sql" :follow-height-of="inputElement" />
    </n-form-item>
  </div>
</template>
