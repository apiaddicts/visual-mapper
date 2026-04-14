/* eslint-disable */
import { App } from 'vue';
import { AxiosError } from 'axios';
import mitt from 'mitt';

// Event bus para comunicarse con el componente de toasts
export const toastEmitter = mitt();

// Tipos para bootstrap-vue-3
interface BvToastOptions {
  title?: string;
  variant?: string;
  pos?: string;
  value?: number;
  solid?: boolean;
}

class CustomToast {
  private app: any;

  constructor(app: any) {
    this.app = app;
  }

  showError(error: AxiosError) {
    const message = CustomToast.buildMessage(error)
    .then((result) => {
      const httpCode = (error.response !== undefined && error.response.status !== undefined && error.response.status !== 0) ? error.response.status : '(Sin código)';
      const headerTest = `Error: ${httpCode}, Fecha: ${new Date().toLocaleString()}`;

      toastEmitter.emit('show-toast', {
        title: headerTest,
        body: result,
        variant: 'danger',
        solid: true,
        value: 0, // 0 = no auto hide
        pos: 'bottom-left',
      });
    });
  }

  private static async buildMessage(error: AxiosError): Promise<string> {
    const url = error.config !== undefined && error.config.url !== undefined ? error.config.url : '(Sin URL)';
    const method = error.config !== undefined && error.config.method !== undefined ? error.config.method.toUpperCase() : '(Sin método HTTP)';

    let responseText = '(Sin respuesta)';

    if (error.response !== undefined && error.response.data instanceof Blob) {
      responseText = await error.response.data.text();
      responseText = CustomToast.stringifyMessage(responseText);
    }
    else if (error.response !== undefined) {
      responseText = CustomToast.stringifyMessage(error.response.data);
    }
    const response = responseText;
    const body = error.config !== undefined && error.config.data !== undefined ? error.config.data : '(Sin body)';
    const responseHeaders = error.response !== undefined && error.response.headers !== undefined ? JSON.stringify(error.response.headers, null, 4) : '(Sin cabeceras)';
    const requestHeaders = error.config !== undefined && error.config.headers !== undefined ? JSON.stringify(error.config.headers, null, 4) : '(Sin cabeceras)';
    const message = `${method} ${url} \nRespuesta de la llamada:\n${response}\n\n\nCabeceras de la respuesta:\n--------------------------\n\n${responseHeaders}\n\n\nBody:\n-----\n\n${body}\n\n\nCabeceras de la petición:\n-------------------------\n\n${requestHeaders}`;

    return Promise.resolve(message);
  }

  private static stringifyMessage(error: any): any {
    try {
      return JSON.stringify(error, null, 4);
    }
    catch (exception) {
      console.error('Error tratando el cuerpo de la respuesta, se esperaba JSON pero no se ha podido parsear. Se devuelve sin tratar.');
      return error.response;
    }
  }

  show(body: string, options: any) {
    toastEmitter.emit('show-toast', {
      body: `${body}`,
      ...options,
    });
  }

  success(title: string, body: string) {
    const toastOptions: BvToastOptions = {
      title: `${title}`,
      variant: 'success',
      pos: 'bottom-left',
      value: 5000, // 5 segundos
      solid: true,
    };
    this.show(body, toastOptions);
  }

  error(err: Error) {
    const title = err.name;
    const body = err.message;
    const toastOptions = {
      title: `${title}`,
      variant: 'danger',
      pos: 'bottom-left',
      value: 0, // 0 = no auto hide
      solid: true,
    };
    this.show(body, toastOptions);
  }

  errorFromServer(err: AxiosError) {
    this.showError(err);
  }

  Error(title: string, body: string) {
    const toastOptions = {
      title: `${title}`,
      variant: 'danger',
      pos: 'bottom-left',
      value: 0, // 0 = no auto hide
      solid: true,
    };
    this.show(body, toastOptions);
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $toast: CustomToast;
  }
}

const ToastService = {
  install: (app: App, options?: any): void => {
    const toastInstance = new CustomToast(app);
    app.config.globalProperties.$toast = toastInstance;
    app.provide('$toast', toastInstance);
  }
};

export default ToastService;
