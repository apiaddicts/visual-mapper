/* eslint-disable no-param-reassign */
import { App } from 'vue';

export const uploadJSON = (ev: any): Promise<any> => new Promise((resolve) => {
  const file = ev.target.files[0];
  const reader = new FileReader();

  reader.onload = (e: any) => {
    const data = JSON.parse(e.target.result);
    resolve(data);
  };
  reader.readAsText(file);
});

const downloadCreatedUrl = (url: string, filename: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
};

export const downloadJSON = (jsonData: any, filename: string):
  Promise<boolean> => new Promise((resolve) => {
  const blobData = JSON.stringify(jsonData, null, 2);
  const blob: Blob = new Blob([blobData], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  downloadCreatedUrl(url, filename);
  resolve(true);
});

export const downloadBlob = (blobData: any, filename: any):
  Promise<boolean> => new Promise((resolve) => {
  const url: string = window.URL.createObjectURL(new Blob([blobData]));
  downloadCreatedUrl(url, filename);
  resolve(true);
});

class FilesManager {
  uploadJSON = uploadJSON;

  downloadJSON = downloadJSON;

  downloadBlob = downloadBlob;
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filesService: FilesManager;
  }
}

const FilesService = {
  install(app: App): void {
    const { globalProperties } = app.config;
    globalProperties.$filesService = new FilesManager();
    app.provide('$filesService', globalProperties.$filesService);
  },
};

export default FilesService;
