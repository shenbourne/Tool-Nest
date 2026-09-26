import yaml from 'js-yaml';
import { i18n } from '@/i18n';

export interface ConversionResult {
  success: boolean;
  output: string;
  error?: string;
}

export function convertDockerComposeTo1panel(input: string): ConversionResult {
  try {
    const parsed = yaml.load(input) as Record<string, unknown>;

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, output: '', error: i18n.global.t('tools.dockerComposeTo1panel.errorInvalidYaml') };
    }

    // Ensure version field (1Panel convention)
    if (!parsed.version) {
      parsed.version = '3.8';
    }

    // Process services
    if (parsed.services && typeof parsed.services === 'object') {
      const services = parsed.services as Record<string, Record<string, unknown>>;

      for (const [serviceName, serviceConfig] of Object.entries(services)) {
        // Add 1Panel-style labels if not present
        if (!serviceConfig.labels) {
          serviceConfig.labels = [];
        }

        const labels = serviceConfig.labels as (string | Record<string, string>)[];
        const has1PanelLabel = labels.some(l => {
          if (typeof l === 'string') return l.startsWith('com.1panel.');
          return Object.keys(l).some(k => k.startsWith('com.1panel.'));
        });

        if (!has1PanelLabel) {
          labels.push({ 'com.1panel.appName': serviceName });
        }

        // Ensure restart policy
        if (!serviceConfig.restart) {
          serviceConfig.restart = 'always';
        }

        // Convert network mode for 1Panel convention
        if (serviceConfig.networks) {
          const networks = serviceConfig.networks;
          if (Array.isArray(networks)) {
            // Convert array to map format (1Panel preference)
            const networkMap: Record<string, null> = {};
            for (const net of networks) {
              networkMap[net] = null;
            }
            serviceConfig.networks = networkMap;
          }
        }
      }
    }

    // Process networks - add 1Panel external naming convention
    if (parsed.networks && typeof parsed.networks === 'object') {
      const networks = parsed.networks as Record<string, Record<string, unknown>>;
      for (const [netName, netConfig] of Object.entries(networks)) {
        if (!netConfig) {
          networks[netName] = { name: netName, driver: 'bridge' };
        } else if (!netConfig.name) {
          netConfig.name = netName;
        }
      }
    }

    // Process volumes
    if (parsed.volumes && typeof parsed.volumes === 'object') {
      const volumes = parsed.volumes as Record<string, Record<string, unknown>>;
      for (const [volName, volConfig] of Object.entries(volumes)) {
        if (!volConfig) {
          volumes[volName] = { driver: 'local' };
        }
      }
    }

    const output = yaml.dump(parsed, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });

    return { success: true, output };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.global.t('tools.dockerComposeTo1panel.errorUnknown');
    return { success: false, output: '', error: i18n.global.t('tools.dockerComposeTo1panel.errorYamlParse', { message }) };
  }
}
