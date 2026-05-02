import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { mediaApi } from '@/shared/api/mediaApi';
import { UploadOutlined } from '@ant-design/icons';

type Props = {
  multiple?: boolean;
  onUpload?: (files: string[]) => void; // returns uploaded URLs (placeholder)
};

export default function MediaUploader({ multiple = true, onUpload }: Props) {
  const [fileList, setFileList] = useState<any[]>([]);

  const handleChange = ({ fileList: fl }: any) => {
    setFileList(fl);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) return message.warning('No files selected');
    try {
      const files = fileList.map((f) => f.originFileObj).filter(Boolean) as File[];
      const res = await mediaApi.upload(files);
      const urls = res?.data || res || [];
      message.success('Files uploaded');
      onUpload?.(urls);
    } catch (e) {
      message.error('Upload failed');
    }
  };

  return (
    <div>
      <Upload
        multiple={multiple}
        fileList={fileList}
        onChange={handleChange}
        beforeUpload={() => false} // prevent auto upload
      >
        <Button icon={<UploadOutlined />}>Select Files</Button>
      </Upload>
      <div style={{ marginTop: 12 }}>
        <Button type="primary" onClick={handleUpload} disabled={fileList.length === 0}>
          Upload
        </Button>
      </div>
    </div>
  );
}
