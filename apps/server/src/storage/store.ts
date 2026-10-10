import { YamlUserPrefsRepository, YamlReportRepository } from './repositories.js';
import type { UserPrefsRepository, ReportRepository } from './repositories.js';

export const userPrefsRepo: UserPrefsRepository = new YamlUserPrefsRepository();
export const reportRepo: ReportRepository = new YamlReportRepository();
