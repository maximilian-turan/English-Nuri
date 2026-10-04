import { ClassicBook } from './classicsTypes';
import { A1_CLASSICS } from './classics/a1Classics';
import { A2_CLASSICS } from './classics/a2Classics';
import { B1_CLASSICS } from './classics/b1Classics';
import { B2_CLASSICS } from './classics/b2Classics';
import { C1_CLASSICS } from './classics/c1Classics';
import { CEFRLevel } from '../types';

export * from './classicsTypes';

export const ALL_CLASSICS_DATA: ClassicBook[] = [
  ...A1_CLASSICS,
  ...A2_CLASSICS,
  ...B1_CLASSICS,
  ...B2_CLASSICS,
  ...C1_CLASSICS,
];

// Default backwards compatibility
export const CLASSICS_DATA = ALL_CLASSICS_DATA;

export function getClassicsByLevel(level: CEFRLevel): ClassicBook[] {
  return ALL_CLASSICS_DATA.filter((b) => b.cefrLevel === level);
}
