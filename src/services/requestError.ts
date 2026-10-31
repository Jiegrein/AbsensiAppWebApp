import axios from 'axios';

/** Turns an axios failure into the Indonesian sentence the page shows; kept free of config imports so tests can load it. */
export const describeRequestError = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const body = typeof error.response.data === 'string' ? error.response.data.trim() : '';
      if (error.response.status === 401) return 'Kunci admin ditolak server. Periksa konfigurasi REACT_APP_ADMIN_KEY.';
      return body || `Server menolak permintaan (HTTP ${error.response.status}).`;
    }
    return 'Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.';
  }
  return fallback;
};
