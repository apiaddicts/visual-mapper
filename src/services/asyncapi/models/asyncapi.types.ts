export interface AsyncAPIServer {
  host: string;
  protocol: string;
  description?: string;
  security?: any[];
}

export interface AsyncAPIChannel {
  address: string;
  messages?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface AsyncAPIOperation {
  action: 'send' | 'receive';
  channel: { $ref: string };
  messages?: Array<{ $ref: string }>;
  summary?: string;
  description?: string;
  bindings?: any;
  reply?: { channel: { $ref: string } };
}

export interface AsyncAPIComponents {
  schemas?: Record<string, any>;
  messages?: Record<string, any>;
  parameters?: Record<string, any>;
  correlationIds?: Record<string, any>;
  messageTraits?: Record<string, any>;
  securitySchemes?: Record<string, any>;
  'x-apigen-models'?: Record<string, any>;
}

export interface AsyncAPIDocument {
  asyncapi: string;
  info: { title: string; version: string; description?: string };
  defaultContentType?: string;
  servers?: Record<string, AsyncAPIServer>;
  channels?: Record<string, AsyncAPIChannel>;
  operations?: Record<string, AsyncAPIOperation>;
  components?: AsyncAPIComponents;
  [key: string]: any;
}
