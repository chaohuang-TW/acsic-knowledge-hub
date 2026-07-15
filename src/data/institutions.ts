import rawInstitutions from './institutions.json';
import type { Institution } from '../types';

/**
 * 公開資料的單一入口。下一輪替換為真實公開資料時，介面與功能層不必改寫。
 */
export const institutions = rawInstitutions as Institution[];
