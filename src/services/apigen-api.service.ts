import axios, { AxiosPromise } from 'axios';

export type ApigenBackend = 'dotnet' | 'springboot' | 'python';

export interface ApigenBackendOption {
  key: ApigenBackend;
  label: string;
  url: string;
  proxyPath: string;
  endpoint: string;
  enabled: boolean;
}

const isDev = process.env.NODE_ENV === 'development';

const BACKENDS: ApigenBackendOption[] = [
  {
    key: 'dotnet',
    label: '.NET',
    url: process.env.VUE_APP_APIGEN_DOTNET_URL || '',
    proxyPath: '/api-apigen-dotnet/v1',
    endpoint: '/generator/file',
    enabled: !!process.env.VUE_APP_APIGEN_DOTNET_URL,
  },
  {
    key: 'springboot',
    label: 'Spring Boot',
    url: process.env.VUE_APP_APIGEN_SPRINGBOOT_URL || '',
    proxyPath: '/api-apigen-springboot/v1',
    endpoint: '/generator/file',
    enabled: !!process.env.VUE_APP_APIGEN_SPRINGBOOT_URL,
  },
  {
    key: 'python',
    label: 'Python',
    url: process.env.VUE_APP_APIGEN_PYTHON_URL || '',
    proxyPath: '/api-apigen-python-dev',
    endpoint: '/api/generate',
    enabled: !!process.env.VUE_APP_APIGEN_PYTHON_URL,
  },
];

function getBackends(): ApigenBackendOption[] {
  return BACKENDS;
}

function getBaseUrl(backend: ApigenBackendOption): string {
  return isDev ? backend.proxyPath : backend.url;
}

function generateArchetype(backendKey: ApigenBackend, yamlContent: string): AxiosPromise<Blob> {
  const backend = BACKENDS.find((b) => b.key === backendKey);
  if (!backend || !backend.url) {
    return Promise.reject(new Error(`Backend "${backendKey}" no configurado.`));
  }

  const baseUrl = getBaseUrl(backend);

  const blob = new Blob([yamlContent], { type: 'application/x-yaml' });
  const formData = new FormData();
  formData.append('file', blob, 'openapi.yaml');

  return axios.post(`${baseUrl}${backend.endpoint}`, formData, {
    responseType: 'blob',
  });
}

export default { getBackends, generateArchetype };
