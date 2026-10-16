import { defineTool } from '@toolnest/shared';
import { legacyTableTabs } from './operations';
export const tool = defineTool({
  name:'tools.tableTools.name', description:'tools.tableTools.description', path:'/table-tools', category:'data',
  tags:['csv','tsv','converter','validator'], keywords:['table','csv','tsv','separator','transpose','columns','incomplete','表格','分隔符','转置','插入列','交换列'],
  redirectFrom:Object.keys(legacyTableTabs),
  component:() => import('./TableTools.vue'), createdAt:'2026-10-14', runtimeLocation:'browser',
});
