<script setup lang="ts">
import { REGION_OPTIONS, generateMainlandIdCardRecords } from './china-mainland-id-card-generator.service';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';

const { t } = useI18n();

const count = useStorage('china-mainland-id-card-generator-count', 10);
const gender = useStorage<'male' | 'female' | 'random'>('china-mainland-id-card-generator-gender', 'random');
const minAge = useStorage('china-mainland-id-card-generator-min-age', 18);
const maxAge = useStorage('china-mainland-id-card-generator-max-age', 60);
const regionCodeForUi = useStorage('china-mainland-id-card-generator-region-code-for-ui', REGION_OPTIONS[0].value);

const genderOptions = computed(() => [
  { label: t('tools.china-mainland-id-card-generator.genderOptions.random'), value: 'random' },
  { label: t('tools.china-mainland-id-card-generator.genderOptions.male'), value: 'male' },
  { label: t('tools.china-mainland-id-card-generator.genderOptions.female'), value: 'female' },
]);

const [records, refreshRecords] = computedRefreshable(() =>
  generateMainlandIdCardRecords({
    count: Math.min(Math.max(count.value ?? 1, 1), 100),
    gender: gender.value,
    minAge: Math.min(minAge.value ?? 18, maxAge.value ?? 60),
    maxAge: Math.max(maxAge.value ?? 60, minAge.value ?? 18),
    regionCodeForUi: regionCodeForUi.value,
  }));

const idsText = computed(() =>
  records.value
    .map(record => [record.id, record.regionCodeForUi, record.birthday, record.gender].join('\t'))
    .join('\n'));
const { copy } = useCopy({ source: idsText, text: t('tools.china-mainland-id-card-generator.copied') });
</script>

<template>
  <div>
    <n-alert type="warning" mb-4>
      {{ t('tools.china-mainland-id-card-generator.warning') }}
    </n-alert>

    <div flex flex-col gap-3>
      <div flex items-center gap-3>
        <span w-120px>{{ t('tools.china-mainland-id-card-generator.quantity') }}</span>
        <n-input-number v-model:value="count" :min="1" :max="100" flex-1 />
      </div>

      <c-buttons-select
        v-model:value="gender"
        :options="genderOptions"
        :label="t('tools.china-mainland-id-card-generator.gender')"
        label-width="120px"
      />

      <div flex items-center gap-3>
        <span w-120px>{{ t('tools.china-mainland-id-card-generator.region') }}</span>
        <c-select
          v-model:value="regionCodeForUi"
          :options="REGION_OPTIONS"
          searchable
          flex-1
        />
      </div>

      <div flex items-center gap-3>
        <span w-120px>{{ t('tools.china-mainland-id-card-generator.minAge') }}</span>
        <n-input-number v-model:value="minAge" :min="0" :max="120" flex-1 />
      </div>

      <div flex items-center gap-3>
        <span w-120px>{{ t('tools.china-mainland-id-card-generator.maxAge') }}</span>
        <n-input-number v-model:value="maxAge" :min="0" :max="120" flex-1 />
      </div>
    </div>

    <c-card mt-5>
      <n-table striped>
        <thead>
          <tr>
            <th>{{ t('tools.china-mainland-id-card-generator.columns.id') }}</th>
<!--            <th>{{ t('tools.china-mainland-id-card-generator.columns.regionCodeForUi') }}</th>-->
            <th>{{ t('tools.china-mainland-id-card-generator.columns.birthday') }}</th>
            <th>{{ t('tools.china-mainland-id-card-generator.columns.gender') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.id">
            <td>
              <span-copyable :value="record.id" />
            </td>
<!--            <td>{{ record.regionCodeForUi }}</td>-->
            <td>{{ record.birthday }}</td>
            <td>{{ record.gender }}</td>
          </tr>
        </tbody>
      </n-table>
    </c-card>

    <div mt-4 flex justify-center gap-3>
      <c-button @click="copy()">
        {{ t('tools.china-mainland-id-card-generator.button.copy') }}
      </c-button>
      <c-button @click="refreshRecords()">
        {{ t('tools.china-mainland-id-card-generator.button.refresh') }}
      </c-button>
    </div>
  </div>
</template>
