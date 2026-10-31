import axios from 'axios';
import { adminKey, apiBaseUrl } from '../config';

/** One axios instance for every admin call: same base URL, same X-Admin-Key header. */
export const adminClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'X-Admin-Key': adminKey },
});
