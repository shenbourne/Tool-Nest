import { describe, expect, it } from 'vitest';
import { useTemperature } from './temperature-model';

describe('synchronized temperature controls', () => {
  it('converts edits from all three units', () => {
    const model = useTemperature();
    expect(model.fahrenheit.value).toBe(32);
    expect(model.kelvin.value).toBe(273.15);
    model.celsius.value = 100;
    expect(model.fahrenheit.value).toBe(212);
    model.fahrenheit.value = -40;
    expect(model.celsius.value).toBe(-40);
    expect(model.kelvin.value).toBe(233.15);
    model.kelvin.value = 300;
    expect(model.celsius.value).toBe(26.85);
    expect(model.fahrenheit.value).toBe(80.33);
  });
  it('preserves the last temperature on empty/nonfinite input and clamps absolute zero', () => {
    const model = useTemperature();
    model.celsius.value = null;
    model.fahrenheit.value = NaN;
    model.kelvin.value = Infinity;
    expect(model.celsius.value).toBe(0);
    model.kelvin.value = -1;
    expect(model.kelvin.value).toBe(0);
    expect(model.celsius.value).toBe(-273.15);
    expect(model.fahrenheit.value).toBe(-459.67);
  });
  it('avoids accumulating conversion error across repeated edits', () => {
    const model = useTemperature();
    model.celsius.value = 12.34;
    for (let i = 0; i < 100; i++) {
      const fahrenheit = model.fahrenheit.value;
      model.fahrenheit.value = fahrenheit;
      const kelvin = model.kelvin.value;
      model.kelvin.value = kelvin;
    }
    expect(model.celsius.value).toBe(12.34);
  });
});

