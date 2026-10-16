export * from './skuSiagaTypes';
import { SKU_SIAGA_MULA } from './skuSiagaMula';
import { SKU_SIAGA_BANTU } from './skuSiagaBantu';
import { SKU_SIAGA_TATA } from './skuSiagaTata';
import { ButirSkuSiaga } from './skuSiagaTypes';

export { SKU_SIAGA_MULA } from './skuSiagaMula';
export { SKU_SIAGA_BANTU } from './skuSiagaBantu';
export { SKU_SIAGA_TATA } from './skuSiagaTata';

export const SKU_SIAGA_LENGKAP: ButirSkuSiaga[] = [
  ...SKU_SIAGA_MULA,
  ...SKU_SIAGA_BANTU,
  ...SKU_SIAGA_TATA,
];
