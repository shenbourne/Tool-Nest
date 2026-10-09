import { describe, expect, it } from 'vitest';
import { convertDockerComposeTo1panel } from './docker-compose-to-1panel.service';

const COMPOSE = `services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    networks:
      - frontend

  api:
    image: node:18
    ports:
      - "3000:3000"
      - "127.0.0.1:9000:9000"
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: example

networks:
  frontend:

volumes:
  pgdata:
`;

describe('convertDockerComposeTo1panel', () => {
  it('keeps the pre-existing conversion rules', () => {
    const result = convertDockerComposeTo1panel(COMPOSE);
    expect(result.success).toBe(true);

    const parsed = result.output;
    expect(parsed).toContain("version: '3.8'");
    expect(parsed).toContain('com.1panel.appName: web');
    expect(parsed).toContain('restart: always');
    expect(parsed).toContain('frontend: null');
    expect(parsed).toContain('name: frontend');
    expect(parsed).toContain('driver: local');
  });

  it('rewrites host ports to 1Panel parameter references in service order', () => {
    const result = convertDockerComposeTo1panel(COMPOSE);
    expect(result.success).toBe(true);

    expect(result.output).toContain('${PANEL_APP_PORT_HTTP}:80');
    expect(result.output).toContain('${PANEL_APP_PORT_1}:3000');
    expect(result.output).toContain('127.0.0.1:${PANEL_APP_PORT_2}:9000');

    expect(result.portParams).toEqual([
      { envKey: 'PANEL_APP_PORT_HTTP', default: '8080', labelEn: 'Port', labelZh: '端口' },
      { envKey: 'PANEL_APP_PORT_1', default: '3000', labelEn: 'Port 1', labelZh: '端口 1' },
      { envKey: 'PANEL_APP_PORT_2', default: '9000', labelEn: 'Port 2', labelZh: '端口 2' },
    ]);
  });

  it('rewrites the published field of long-form port mappings', () => {
    const result = convertDockerComposeTo1panel(`services:
  app:
    image: nginx
    ports:
      - target: 80
        published: "8080"
        protocol: tcp
`);
    expect(result.success).toBe(true);
    expect(result.output).toContain('published: ${PANEL_APP_PORT_HTTP}');
    expect(result.portParams?.[0].default).toBe('8080');
  });

  it('leaves non-numeric and malformed port entries untouched', () => {
    const result = convertDockerComposeTo1panel(`services:
  app:
    image: nginx
    ports:
      - "80"
      - "http:80"
`);
    expect(result.success).toBe(true);
    expect(result.output).toContain("'80'");
    expect(result.output).toContain('http:80');
    expect(result.portParams).toEqual([]);
  });

  it('reports invalid YAML as an error', () => {
    const result = convertDockerComposeTo1panel('services: [unclosed');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
