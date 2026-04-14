// Se incluyen los starters en un fichero JavaScript
// Se opta por hacerlo en un JavaScript puesto que TypeScript requiere definir un tipo por cada módulo.

// Tanto el export default (módulo default) como la carga de un JSON deben usar el mismo proceso, pero en el caso de 
// hacerlo como JavaScript se puede omitir este tipado (por defecto le asigna any)

// TypeScript sí que requiere que los imports de JavaScript se autoricen explícitamente en el fichero tsconfig.json ("allowJs": "true")
export default [
  {
    title: 'japi-starter-hikari',
    description: 'Starter de BBDD estándar. \r\nLo tendrán la mayoría de las aplicaciones. Es incompatible con los demás starters de BBDD',
    selected: true,
  }, 
  {
    title: 'japi-starter-exadata',
    description: 'Starter de BBDD cuando se usan BBDD Exada. \r\nEs incompatible con los demás starters de BBDD',
    selected: false,
  }, 
  {
    title: 'japi-starter-h2mem',
    description: 'Starter de BBDD en memoria. \r\nEs incompatible con los demás starters de BBDD al arrancar la aplicación, pero es necesario para los tests que se ejecuten contra una base de datos en memoria. Puede eliminarse si no se incluye japi-starter-test y no se usa este tipo de base de datos, o si no se tienen este tipo de tests.',
    selected: false,
  }, 
  {
    title: 'japi-starter-auditoria',
    description: 'Permite activar la auditoría de protección de datos BBDD\r\n Permite usar las anotaciones @CoreAuditable',
    selected: false,
  }, 
  {
    title: 'japi-starter-seguridad',
    description: 'Permite configurar la seguridad de los servicios Rest. \r\nTanto con WSO2 como con OSB ',
    selected: true,
  },  
  {
    title: 'japi-starter-openapi',
    description: 'Permite el uso las anotaciones OpenApi 3.0 en los controladores. \r\nGenerar un swagger-ui automático en OpenApi 3.0',
    selected: true,
  }, 
  {
    title: 'japi-starter-test',
    description: 'Permite configurar la seguridad de los servicios Rest. \r\nDepende del uso de japi-starter-h2mem para los tests E2E, como los generados para los controladores',
    selected: true,
  }, 
  {
    title: 'japi-starter-swagger',
    description: 'Permite el uso las anotaciones Swagger 2.0 en los controladores. \r\nGenerar un swagger-ui automático en Swager 2.0',
    selected: false,
  },   
  {
    title: 'japi-starter-fica',
    description: 'Permite configurar FICA. \r\nUsar el sistema de almacenamiento de ficheros FICA de Madrid Digital',
    selected: false,
  }, 
  {
    title: 'japi-starter-documentos',
    description: 'Permite usar la integración de documentos.\r\nUsar el servicio DocumentosService del servicio REST de CORE_REST_DOCUMENTOS',
    selected: false,
  }, 
  {
    title: 'japi-starter-sms',
    description: 'Permite usar la integración de envio de SMS.\r\nUsar el servicio MentesSmsService ',
    selected: false,
  },   
  {
    title: 'japi-starter-afc',
    description: 'Permite usar la integración con la plataforma de firma centralizada AFC. \r\nUsar los servicios AfcOpServidorService, AfcOpCertificadoService y AfcOpEncriptadoService ',
    selected: false,
  },   
  {
    title: 'japi-starter-eadm',
    description: 'Permite usar la integración de Administración Electrónica EADM. \r\nUsar los servicios CoveService, EregAltaService, EregConsultaService, EregTramitacionService, EregV3Service, IcdaService, IcdaTgssService, IcdaCmService, IcdaDgtService, PtfrService, NoteService, SiexService, y AdexService',
    selected: false,
  }, 
  {
    title: 'japi-starter-kafka',
    description: 'Permite usar la integración con eventos basados en Kafka. \r\nEsto permite implementar un API asíncrona, para la que se deberá de disponer de una definición en AsyncAPI. Esto no excluye el uso de otros starters.',
    selected: false,
  },
  {
    title: 'japi-starter-office-docs',
    description: 'Proporciona dependencias para manejar documentos con formatos como los de Microsoft Office. En la versión 1.5.0 de JAPI, no incluye utilidades adicionales, y se limita a proporcionar las dependencias de Apache POI.',
    selected: false,
  },
  {
    title: 'japi-starter-admin-client',
    description: 'Permite configurar la conexión como cliente de Spring Boot Admin (SBA)',
    selected: false,
  },  
];
