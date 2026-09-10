const API_BASE_URL_VARIABLE = 'REACT_APP_API_BASE_URL';

const ensureTrailingSlash = (url: string): string => (url.endsWith('/') ? url : `${url}/`);

const readRequired = (name: string, value: string | undefined): string => {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(
      `${name} is not set. Add it to .env (see .env.example) or pass it as an environment variable / Docker build argument.`
    );
  }
  return trimmed;
};

// Create React App inlines REACT_APP_* variables at build time, so this is resolved once per build.
export const apiBaseUrl: string = ensureTrailingSlash(
  readRequired(API_BASE_URL_VARIABLE, process.env.REACT_APP_API_BASE_URL)
);
