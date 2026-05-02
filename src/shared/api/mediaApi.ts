import { http } from '@/shared/api/http';
import { endpoints } from '@/shared/api/endpoints';

export const mediaApi = {
  upload: async (files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const res = await http.post(endpoints.media, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
