import { i18n } from '@/i18n';
export interface DockerComposeService {
  image: string;
  container_name?: string;
  ports?: string[];
  volumes?: string[];
  environment?: Record<string, string>;
  restart?: string;
  network_mode?: string;
  command?: string;
  detached?: boolean;
}

export interface ParseResult {
  yaml: string;
  error: string | null;
  warnings: string[];
}

function escapeYamlString(s: string): string {
  if (s.includes('"') || s.includes("'") || s.includes(':') || s.includes('#') || s.includes('{') || s.includes('}') || s.includes('[') || s.includes(']') || s.includes(',') || s.includes('&') || s.includes('*') || s.includes('?') || s.includes('|') || s.includes('-') || s.includes('<') || s.includes('>') || s.includes('=') || s.includes('!') || s.includes('%') || s.includes('@') || s.includes('`') || s === '' || /^\s/.test(s) || /\s$/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

export function parseDockerRun(command: string): ParseResult {
  const warnings: string[] = [];

  if (!command.trim()) {
    return { yaml: '', error: null, warnings: [] };
  }

  // Flags that never take a value. Without this set, an unknown flag falls
  // into the heuristic below and swallows the following token — so
  // `docker run --rm nginx` discards `nginx` and reports "no image".
  const BOOLEAN_FLAGS = new Set([
    '-i', '--interactive', '-t', '--tty', '-it', '-ti',
    '--rm', '--privileged', '--init', '--read-only', '--oom-kill-disable',
    '--no-healthcheck', '--sig-proxy', '-d', '--detach',
  ]);

  try {
    const tokens = tokenize(command.trim());
    const service: DockerComposeService = { image: '' };
    const envMap: Record<string, string> = {};

    let i = 0;
    // Skip "docker" and "run"
    while (i < tokens.length) {
      if (tokens[i] === 'docker' || tokens[i] === 'run') {
        i++;
      } else {
        break;
      }
    }

    const commandParts: string[] = [];
    let collectingCommand = false;

    while (i < tokens.length) {
      const token = tokens[i];

      if (collectingCommand) {
        commandParts.push(token);
        i++;
        continue;
      }

      if (token === '-d' || token === '--detach') {
        service.detached = true;
        i++;
      } else if ((token === '-p' || token === '--publish') && i + 1 < tokens.length) {
        i++;
        if (!service.ports) service.ports = [];
        service.ports.push(tokens[i]);
        i++;
      } else if ((token === '-v' || token === '--volume') && i + 1 < tokens.length) {
        i++;
        if (!service.volumes) service.volumes = [];
        service.volumes.push(tokens[i]);
        i++;
      } else if ((token === '-e' || token === '--env') && i + 1 < tokens.length) {
        i++;
        const envStr = tokens[i];
        const eqIdx = envStr.indexOf('=');
        if (eqIdx !== -1) {
          envMap[envStr.substring(0, eqIdx)] = envStr.substring(eqIdx + 1);
        } else {
          envMap[envStr] = '';
        }
        i++;
      } else if ((token === '--name') && i + 1 < tokens.length) {
        i++;
        service.container_name = tokens[i];
        i++;
      } else if ((token === '--restart') && i + 1 < tokens.length) {
        i++;
        service.restart = tokens[i];
        i++;
      } else if ((token === '--network') && i + 1 < tokens.length) {
        i++;
        service.network_mode = tokens[i];
        i++;
      } else if (token === '--log-opt') {
        warnings.push(i18n.global.t('tools.dockerRunToCompose.warnLogOpt'));
        i++;
        if (i < tokens.length && !tokens[i].startsWith('-')) {
          i++;
        }
      } else if (BOOLEAN_FLAGS.has(token)) {
        i++;
      } else if (token.startsWith('-')) {
        warnings.push(i18n.global.t('tools.dockerRunToCompose.warnUnsupportedFlag', { flag: token }));
        i++;
        // Skip the value if the flag expects one
        if (i < tokens.length && !tokens[i].startsWith('-')) {
          i++;
        }
      } else {
        // This should be the image name
        if (!service.image) {
          service.image = token;
          i++;
          // Everything after image is the command
          if (i < tokens.length) {
            collectingCommand = true;
          }
        } else {
          commandParts.push(token);
          collectingCommand = true;
          i++;
        }
      }
    }

    if (Object.keys(envMap).length > 0) {
      service.environment = envMap;
    }

    if (commandParts.length > 0) {
      service.command = commandParts.join(' ');
    }

    if (!service.image) {
      return { yaml: '', error: i18n.global.t('tools.dockerRunToCompose.errorNoImage'), warnings };
    }

    const yaml = buildYaml(service);
    return { yaml, error: null, warnings };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.global.t('tools.dockerRunToCompose.errorParseFailed');
    return { yaml: '', error: message, warnings };
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (escaped) {
      current += c;
      escaped = false;
      continue;
    }

    if (c === '\\' && !inSingle) {
      escaped = true;
      current += c;
      continue;
    }

    if (c === "'" && !inDouble) {
      inSingle = !inSingle;
      continue;
    }

    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
      continue;
    }

    if ((c === ' ' || c === '\t') && !inSingle && !inDouble) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += c;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function buildYaml(service: DockerComposeService): string {
  const serviceName = sanitizeServiceName(service.container_name || service.image);
  const lines: string[] = [];

  lines.push('services:');
  lines.push(`  ${serviceName}:`);
  lines.push(`    image: ${escapeYamlString(service.image)}`);

  if (service.container_name) {
    lines.push(`    container_name: ${escapeYamlString(service.container_name)}`);
  }

  if (service.ports && service.ports.length > 0) {
    lines.push('    ports:');
    for (const port of service.ports) {
      lines.push(`      - ${escapeYamlString(port)}`);
    }
  }

  if (service.volumes && service.volumes.length > 0) {
    lines.push('    volumes:');
    for (const vol of service.volumes) {
      lines.push(`      - ${escapeYamlString(vol)}`);
    }
  }

  if (service.environment && Object.keys(service.environment).length > 0) {
    lines.push('    environment:');
    for (const [key, value] of Object.entries(service.environment)) {
      if (value === '') {
        lines.push(`      ${escapeYamlString(key)}: ""`);
      } else {
        lines.push(`      ${escapeYamlString(key)}: ${escapeYamlString(value)}`);
      }
    }
  }

  if (service.restart) {
    lines.push(`    restart: ${escapeYamlString(service.restart)}`);
  }

  if (service.network_mode) {
    lines.push(`    network_mode: ${escapeYamlString(service.network_mode)}`);
  }

  if (service.command) {
    lines.push(`    command: ${escapeYamlString(service.command)}`);
  }

  return lines.join('\n') + '\n';
}

function sanitizeServiceName(name: string): string {
  return name
    .replace(/^[^a-zA-Z]+/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^[^a-zA-Z0-9]+/, 'service')
    || 'service';
}
