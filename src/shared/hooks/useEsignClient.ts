import { useCallback } from 'react';

export function useEsignClient() {
  const sign = useCallback(async (contractId: string) => {
    // Placeholder: open esign modal or redirect — use contractId in real flow
    console.log('esign sign called for', contractId);
    return { success: true, signedAt: new Date().toISOString(), contractId };
  }, []);

  return { sign };
}
