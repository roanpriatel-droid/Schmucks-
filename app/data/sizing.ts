/**
 * Gildan 5000 (Heavy Cotton adult tee) — the blank we print on. Used by the
 * Size & Fit guide page and the PDP size-guide modal.
 *
 * Measurements are of the garment laid flat, in inches:
 * - `chest`  — half chest, measured 1" below the armhole (double for full chest)
 * - `length` — body length from the high point of the shoulder
 * - `sleeve` — sleeve length from the shoulder seam
 *
 * Body length and half-chest are Gildan's published spec for the 5000; expect
 * the usual ±1" garment tolerance.
 */
export type SizeRow = {
  size: string;
  chest: number;
  length: number;
  sleeve: number;
};

export const BLANK_NAME = 'Gildan 5000 Heavy Cotton';

export const SIZES: SizeRow[] = [
  {size: 'S', chest: 18, length: 28, sleeve: 8},
  {size: 'M', chest: 20, length: 29, sleeve: 8.5},
  {size: 'L', chest: 22, length: 30, sleeve: 9},
  {size: 'XL', chest: 24, length: 31, sleeve: 9.5},
  {size: '2XL', chest: 26, length: 32, sleeve: 10},
  {size: '3XL', chest: 28, length: 33, sleeve: 10.5},
];
