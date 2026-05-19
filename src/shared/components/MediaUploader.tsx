import { useState } from 'react';
import { Upload, Button, message } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { mediaApi } from '@/shared/api/mediaApi';
import { UploadOutlined } from '@ant-design/icons';

type Props = {
  multiple?: boolean;
  onUpload?: (files: string[]) => void; // returns uploaded URLs (placeholder)
};

export default function MediaUploader({ multiple = true, onUpload }: Props) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleChange: UploadProps['onChange'] = ({ fileList: fl }) => {
    setFileList(fl);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) return message.warning('No files selected');
    try {
      const files = fileList.reduce<File[]>((acc, file) => {
        if (file.originFileObj instanceof File) {
          acc.push(file.originFileObj);
        }
        return acc;
      }, []);
      const res = await mediaApi.upload(files);
      const urls = res.data.map((file) => file.url);
      message.success('Files uploaded');
      onUpload?.(urls);
    } catch {
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
