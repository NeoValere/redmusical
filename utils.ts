
export function darkenColor(hex: string, percent: number): string {
  // Remove '#' if present
  hex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const num = parseInt(hex, 16);

  let r = (num >> 16);
  let g = (num >> 8) & 0x00FF;
  let b = num & 0x0000FF;

  r = Math.round(r * (1 - percent / 100));
  g = Math.round(g * (1 - percent / 100));
  b = Math.round(b * (1 - percent / 100));

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');

  return `#${newHex}`;
}
