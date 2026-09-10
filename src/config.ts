const DEFAULT_API_BASE_URL = 'https://absensiappwebapi.azurewebsites.net/api/v1/admin/';

const ensureTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

export const apiBaseUrl: string = ensureTrailingSlash(
  process.env.REACT_APP_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
);
