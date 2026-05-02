import { Card, Button } from 'antd';
import { useEsignClient } from '@/shared/hooks/useEsignClient';

export default function ConsignmentContractSignPage() {
  const { sign } = useEsignClient();

  return (
    <Card title="Consignment Contract">
      <p>Contract content placeholder.</p>
      <Button type="primary" onClick={async () => { const r = await sign('contract-123'); console.log(r); }}>Sign Contract</Button>
    </Card>
  );
}
