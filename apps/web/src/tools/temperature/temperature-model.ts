import { computed, ref } from 'vue';

export function useTemperature() {
  const temperature = ref(0);
  function unit(toUnit: (value: number) => number, fromUnit: (value: number) => number) {
    return computed({
      get: () => Number(toUnit(temperature.value).toFixed(6)),
      set: (value: number | null) => {
        if (value !== null && Number.isFinite(value)) {
          temperature.value = Math.max(-273.15, fromUnit(value));
        }
      },
    });
  }
  return {
    celsius: unit(value => value, value => value),
    fahrenheit: unit(value => value * 9 / 5 + 32, value => (value - 32) * 5 / 9),
    kelvin: unit(value => value + 273.15, value => value - 273.15),
  };
}
