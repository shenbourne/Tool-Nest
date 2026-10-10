import yaml from 'js-yaml';
import { i18n } from '@/i18n';

export interface PortParam {
  envKey: string;
  default: string;
  labelEn: string;
  labelZh: string;
}

export interface ConversionResult {
  success: boolean;
  output: string;
  error?: string;
  portParams?: PortParam[];
}

const SHORT_PORT_RE = /^(?:(\[[0-9a-fA-F:]+\]|[\w.]+):)?(\d+):(\d+(?:\/[\w-]+)?)$/;

function nextParamRef(index: number): string {
  return index === 0 ? 'PANEL_APP_PORT_HTTP' : `PANEL_APP_PORT_${index}`;
}

function makePortParam(index: number, hostPort: string): PortParam {
  const suffix = index === 0 ? '' : ` ${index}`;
  return {
    envKey: nextParamRef(index),
    default: hostPort,
    labelEn: `Port${suffix}`,
    labelZh: `端口${suffix}`,
  };
}

// Rewrite every numeric host port to a 1Panel parameter reference, in service
// order. The first published port becomes PANEL_APP_PORT_HTTP (the 1Panel
// convention for the app's web port), later ones PANEL_APP_PORT_1..N.
function parametrizePorts(services: Record<string, Record<string, unknown>>): PortParam[] {
  const params: PortParam[] = [];

  for (const serviceConfig of Object.values(services)) {
    const ports = serviceConfig.ports;
    if (!Array.isArray(ports)) continue;

    for (let i = 0; i < ports.length; i++) {
      const entry = ports[i];
      if (typeof entry === 'string') {
        const match = SHORT_PORT_RE.exec(entry);
        if (!match) continue;
        const [, ip, hostPort, container] = match;
        const param = makePortParam(params.length, hostPort);
        params.push(param);
        ports[i] = `${ip ? `${ip}:` : ''}\${${param.envKey}}:${container}`;
      } else if (entry && typeof entry === 'object') {
        const longForm = entry as Record<string, unknown>;
        const published = longForm.published;
        if (typeof published === 'string' && /^\d+$/.test(published)) {
          const param = makePortParam(params.length, published);
          params.push(param);
          longForm.published = `\${${param.envKey}}`;
        }
      }
    }
  }

  return params;
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

      const portParams = parametrizePorts(services);
      const output = dumpCompose(parsed);
      return { success: true, output, portParams };
    }

    const output = dumpCompose(parsed);
    return { success: true, output, portParams: [] };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.global.t('tools.dockerComposeTo1panel.errorUnknown');
    return { success: false, output: '', error: i18n.global.t('tools.dockerComposeTo1panel.errorYamlParse', { message }) };
  }
}

function dumpCompose(parsed: Record<string, unknown>): string {
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

  return yaml.dump(parsed, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });
}
