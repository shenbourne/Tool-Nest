import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const pending = vi.hoisted(() => [] as Array<{ resolve: (value: Response) => void }>);

vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn(),
});
vi.stubGlobal('document', { documentElement: { classList: { toggle: vi.fn() }, lang: '' } });
vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>((resolve) => pending.push({ resolve }))));

describe('preference save ordering', () => {
  beforeEach(() => {
    pending.splice(0);
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('keeps the newest optimistic preferences while delayed responses are serialized', async () => {
    const { usePreferencesStore } = await import('./preferences.store');
    const store = usePreferencesStore();
    const first = store.save({ favorites: ['/a'] });
    const second = store.save({ favorites: ['/a', '/b'] });

    await Promise.resolve();
    expect(fetch).toHaveBeenCalledTimes(1);
    pending[0].resolve(new Response(JSON.stringify({ success: true, data: { favorites: ['/a'] } }), { status: 200 }));
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(store.prefs.favorites).toEqual(['/a', '/b']);

    pending[1].resolve(new Response(JSON.stringify({ success: true, data: { favorites: ['/a', '/b'] } }), { status: 200 }));
    await Promise.all([first, second]);
    expect(store.prefs.favorites).toEqual(['/a', '/b']);
  });
});
