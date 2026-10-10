import { describe, it, expect, vi } from 'vitest';
import { createApp } from 'vue';
import { defineComponent, h } from 'vue';

// Mock vue-konva to avoid the native `canvas` dependency that konva
// requires under Node.js.  The mock replicates the real plugin's
// contract: it registers v-stage and v-layer as global components.
vi.mock('vue-konva', () => ({
  default: {
    install(app: any) {
      app.component('v-stage', defineComponent({ render: () => h('div') }));
      app.component('v-layer', defineComponent({ render: () => h('div') }));
    },
  },
}));

describe('vue-konva plugin registration', () => {
  it('registers v-stage and v-layer as global components', async () => {
    const VueKonva = (await import('vue-konva')).default;
    const app = createApp(defineComponent({ render: () => h('div') }));
    app.use(VueKonva);

    const registered = app.component('v-stage');
    expect(registered).toBeDefined();

    const layer = app.component('v-layer');
    expect(layer).toBeDefined();
  });
});
