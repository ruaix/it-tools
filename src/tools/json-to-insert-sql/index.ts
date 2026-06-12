import { TableExport } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.json-to-insert-sql.title'),
  path: '/json-to-insert-sql',
  description: translate('tools.json-to-insert-sql.description'),
  keywords: ['json', 'sql', 'insert', 'table', 'database'],
  component: () => import('./json-to-insert-sql.vue'),
  icon: TableExport,
  createdAt: new Date('2026-06-09'),
});
