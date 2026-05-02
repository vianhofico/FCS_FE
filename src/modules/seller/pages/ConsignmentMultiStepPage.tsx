import { useState } from 'react';
import { Card, Steps, Button, message } from 'antd';
import MediaUploader from '@/shared/components/MediaUploader';
import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';

export default function ConsignmentMultiStepPage() {
  const [step, setStep] = useState(0);

  return (
    <Card title="Create Consignment">
      <Steps current={step} items={[{ title: 'Basic info' }, { title: 'Media' }, { title: 'Pricing' }, { title: 'Review & Submit' }]} />

      <div style={{ marginTop: 16 }}>
        {step === 1 && <MediaUploader onUpload={(urls) => console.log('uploaded', urls)} />}
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button onClick={() => setStep(Math.max(0, step - 1))}>Back</Button>
        <Button
          type="primary"
          onClick={async () => {
            if (step < 3) return setStep(Math.min(3, step + 1));
            // Submit consignment
            try {
              const payload = { /* collect payload from form state - placeholder */ };
              await http.post(endpoints.consignments, payload);
              message.success('Consignment submitted');
            } catch {
              message.error('Submit failed');
            }
          }}
        >
          {step === 3 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </Card>
  );
}
