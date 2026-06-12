import { Id } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.china-mainland-id-card-generator.title'),
  path: '/china-mainland-id-card-generator',
  description: translate('tools.china-mainland-id-card-generator.description'),
  keywords: ['china', 'mainland', 'id', 'identity', 'card', 'test', 'fake', 'generator'],
  component: () => import('./china-mainland-id-card-generator.vue'),
  icon: Id,
  createdAt: new Date('2026-05-14'),
});
