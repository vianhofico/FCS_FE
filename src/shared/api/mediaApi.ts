import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';

export interface UploadMediaResponse {
  fileName: string;
  objectKey: string;
  url: string;
  contentType: string;
  sizeBytes: number;
}

export const mediaApi = {
  upload: async (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const res = await http.post<{ data: UploadMediaResponse[] }>(`${endpoints.media}/upload`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
