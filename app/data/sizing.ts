/**
 * Shared unisex tee sizing (flat-measured, inches). Used by the Size & Fit
 * guide page and the PDP size-guide modal. Replace with the real Printify blank
 * spec sheet when available (see NEEDS_INPUT.md).
 */
export type SizeRow = {size: string; chest: number; length: number; sleeve: number};

export const SIZES: SizeRow[] = [
  {size: 'S', chest: 18, length: 28, sleeve: 8},
  {size: 'M', chest: 20, length: 29, sleeve: 8.5},
  {size: 'L', chest: 22, length: 30, sleeve: 9},
  {size: 'XL', chest: 24, length: 31, sleeve: 9.5},
  {size: '2XL', chest: 26, length: 32, sleeve: 10},
  {size: '3XL', chest: 28, length: 33, sleeve: 10.5},
];
