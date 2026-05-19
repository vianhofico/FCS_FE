import { useCallback } from 'react';

import { consignmentApi } from '@/modules/seller/api/consignmentApi';
import type { SignConsignmentContractRequest } from '@/shared/contracts/consignmentContract';

export function useEsignClient() {
  const sign = useCallback((contractId: string, payload: SignConsignmentContractRequest) => {
    return consignmentApi.signConsignmentContract(contractId, payload);
  }, []);

  return { sign };
}
