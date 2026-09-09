import { ChartCustomization } from '@/types';

export const chartPalettes = {
  light: ['#2563eb', '#16a34a', '#f97316', '#9333ea', '#dc2626', '#0891b2', '#ca8a04', '#db2777'],
  dark: ['#60a5fa', '#4ade80', '#fb923c', '#c084fc', '#f87171', '#22d3ee', '#fde047', '#f472b6'],
};

export const colorAt = (index: number, customization?: Pick<ChartCustomization, 'colors'>, dark = false) => {
  const colors = customization?.colors?.length ? customization.colors : dark ? chartPalettes.dark : chartPalettes.light;
  return colors[index % colors.length];
};

export const colorsFor = (count: number, customization?: Pick<ChartCustomization, 'colors'>, dark = false) => Array.from({ length: count }, (_, index) => colorAt(index, customization, dark));
