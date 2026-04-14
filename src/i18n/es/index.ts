export default {
  emptyList: 'El listado está vacío',
  loading: 'Recibiendo y cargando información',
  loadingTables: 'Cargando el listado de tablas, dependiendo de los esquemas cargados, o lo grandes que sean estos, puede tardar un poco. Si ha cargado todos los esquemas sin seleccionar ningún prefijo, podría tardar varios minutos, dado que cargará todas las tablas de todos los esquemas',
  menu: {
    application: 'Aplicación',
    connection: 'Datos de conexión',
    resources: 'Recursos REST',
    asyncapi: 'Recursos Async',
  },
  header: {
    title: 'VISUAL MAPPER ',
    export: 'Exportar configuración',
    import: 'Importar configuración',
    generate: 'Generar código',
    generateController: 'Generar código del controlador',
    collapse: 'Esconder o mostrar menú',
    token: 'Refrescar token (sólo si falla la autenticación)',
    tables: 'Recargar tablas (sólo si alguna relación o tabla no se muestra)',
  },
  footer: {
    copy: 'Copyright © OpenDataSpace',
    status: {
      connection_error: `Alguno de los servicios REST no tiene conectividad con el JWKS.
      
      La conexión se está haciendo desde el cliente, que es este navegador, lo que implica que probablemente desde su red o VPN no tiene conexión a los servidores, los servidores no están alojados en el mismo dominio que utiliza esta página web.
      
      Puede comprobar el host que emplean los servidores clicando el icono azul situado a la derecha de cada sección, por favor, asegúrese de que su conexión de red tiene acceso al dominio que se carga en estas rutas.`,
      modal: 'Comprobar conectividad',
      retryButton: 'Volver a probar conectividad',
      title: 'Estado de los microservicios',
      configGenerator: 'Config Generator Status',
      projectGenerator: 'Project Generator Status',
      wso2: 'WSO2 Status',
      success: 'Conectividad a todos los servicios correcta',
      error: `Parece que hay un problema de conectividad.
        Compruebe que está conectado a la VPN y si este problema persiste, el responsable de su equipo debe solicitar acceso al dominio <http://apis.comunidad.madrid> en la VPN que se esté utilizando por los cauces habituales para accesos por la VPN.
        Puede probar, manteniendo este modal abierto, a desconectar la VPN y usar el botón de 'Volver a probar conectividad'. Si con la VPN quitada la conectividad es correcta el problema es de su VPN.`,
    },
  },
  tables: {
    title: 'Selecciona tablas y verbos',
    search: 'Filtrar tablas',
    searchVerbs: 'Selecciona los verbos',
  },
  application: {
    title: 'Datos de la aplicación',
    name: 'Nombre del OpenAPI',
    description: 'Descripción',
    group: 'Paquete Java (Ej: org.madrid.xxxx)',
    artifact: 'Artifact',
    version: 'Versión (Ej: 1.0.0)',
    packageName: 'Package Name',
    info: {
      name: 'El nombre del archivo que irá en el x-apigen-project.',
      description: 'Descripción del OpenAPI a generar, irá en el x-apigen-project.',
      group: `Paquete Java del código generado.<br/><br/>
      Formato: org.madrid.xxx<br/>
      Todo en minúsculas sin espacios ni acentos<br/>
      Siendo:<br/><br/>
      xxxx, el código poaps del proyecto<br/><br/>
      Si se quiere, se podrá añadir otro. Y otro paquete que se desee.<br/><br/>
      Ejemplos:<br/>
      - org.madrid.sice<br/>
      - org.madrid.sice.alumnos`,
      version: `Versión de la aplicación<br/><br/>
      Formato: nn.nn.nn<br/><br/>
      La primera versión será 1.0.0<br/>
      El primer dígito, como buena práctica, deberá coincidir con la versión del swagger o api.`,
    },
    generationOptions: {
      title: 'Opciones de generación',
      tests: 'Generación de tests',
      testsInfo: '<div style="text-align: start">Con esta opción se habilita la generación de test en los arquetipos.<br/><br/>Sólo se generarán test para la parte REST del API, no para los elementos asíncronos (relacionados con el AsyncAPI). Tenga en cuenta que el starter "japi-starter-test" deberá de estar selecionado para poder marcar esta opción.</div>', 
      files: 'Generación de recursos /files de ejemplo',
      filesInfo: `<div style="text-align: start">Esta opción genera un paquete files, con una serie de clases que dan ejemplos hechos de: 
      <br/>
      - Subida de ficheros
      <br/>
      - Descarga de ficheros
      <br/>
      - Borrado de ficheros <br/><br/>Para un directorio compartido, temporal, y subiendo el fichero en partes (chunks), completo, en base 64...<br/><br/>Estos recursos se dan como ejemplo, y deben eliminarse de la aplicación o incluirse dentro del fichero OpenAPI para poder usarse.<br/><br/>El paquete files no tiene dependencia con ninguna otra parte de la aplicación, puede eliminarse sin inconveniente
      </div>`,
    },
    kafka_credentials: {
      title: 'Credenciales para la conexión con Kafka',
      info: `Ha seleccionado el starter de Kafka, lo que implica que desea conectarse con una instalación de Apache Kafka.<br/><br/>
      De ser así, se requerirán unas credenciales para realizar esta conexión. Estas pueden escribirse aquí, y se generarán encriptadas en los ficheros properties.<br/><br/>
      Como en cada uno de los entornos donde se despliegan las APIs, se puede querer conectar con unas credenciales diferentes, puede incluirlas todas en este punto.<br/><br/>
      Esto no implica que estas credenciales no puedan modificarse a posteriori ni que sea obligatoria su inserción.<br/><br/>
      De no incluirse, se generarán apuntando a variables de entorno (KAFKA_USER, KAFKA_PASSWORD).`,
    },
    starters: {
      title: 'Starters a incluir en la aplicación',
      info: `Un starter es, en JAPI y en otros proyectos Spring Boot, un conjunto de dependencias añadido <br/>
      para realizar alguna función específica. <br/><br/>
      Este conjunto de dependencias se distribuyen unificadas como un starter.<br/> 
      Por ejemplo, existe en Spring Boot 'spring-boot-starter-web' que descarga y habilita en Spring Boot <br/>
      toda la funcionalidad relacionada con servidores REST.<br/><br/>
      De la misma forma, en JAPI se proporciona una serie de starters que se han de seleccionar y añadir.`,
      non_included: 'No se ha incluído ningún starter',
      default: `Estas opciones de configuración por defecto, seleccionan los starters mínimos necesarios para cada función descrita.<br/><br/>
      Se puede seleccionar una de estas opciones y completarla con los que fueran necesarios, pulsando sobre el botón 'Editar starters'`,
    },
    entities: {
      additional: `Genera las clases de dominio, clases DAO y clases servicio de las entidades que se indiquen aquí.<br/>
      Se usará solo para las entidadades que:<br/><br/>
      - NO estén relacionadas con la tabla principal <br/>de este recurso en BBDD<br/>
      - NO se usen en otro recurso de este API<br/><br/>

      Si se define una entidad que se usa en otro recurso del API, se ignorará porque ya se crearán para ese recurso las clases de dominio, DAOs y servicios`,
    },
    targetFramework: {
      title: 'Generador objetivo',
      python: 'Python apigen',
      springboot: 'Spring Boot apigen',
      groupId: 'Group ID',
      groupIdHint: 'Dominio invertido en minúsculas',
      artifactId: 'Artifact ID',
      artifactIdHint: 'Una palabra, minúsculas, sin guiones',
      basePackage: 'Base package (auto)',
    },
  },
  generateSql: {
    autoLoaded: 'OpenAPI cargado automáticamente desde el contexto actual',
    fileLabel: 'Archivo OpenAPI (YAML / JSON)',
    fileHint: 'Sube un OpenAPI limpio (sin extensiones x-apigen-*)',
    tablePrefix: 'Prefijo de tablas',
    tablePrefixResult: 'Resultado:',
    relationsPrefix: 'Prefijo de tablas de relación',
    relationsPrefixHint: 'Solo para relaciones ManyToMany (arrays con $ref).',
    relationsPrefixResult: 'Resultado:',
    dbSchema: 'Schema de BD',
    dbSchemaHint: '(opcional — solo PostgreSQL)',
    dbSchemaPlaceholder: 'ej: public — dejar vacío para MySQL/MariaDB',
    preview: 'Vista previa',
    previewBtn: 'Vista previa',
    downloadBtn: 'Descargar .sql',
    useBtn: 'Usar en Crear BD',
    noSchemas: 'No se encontraron schemas en el documento.',
    parseError: 'Error al parsear el archivo: {msg}',
    generateError: 'Error al generar SQL: {msg}',
  },
  connection: {
    title: 'Datos de la conexión a base de datos',
    modeConnect: 'Conectar a BD existente',
    modeCreate: 'Crear BD desde SQL',
    dbType: 'Tipo de base de datos',
    schema: 'Esquema',
    requiredFields: 'Los campos marcados con * son obligatorios',
    createDbInfo: 'Sube un archivo .sql con los CREATE TABLE para crear la base de datos',
    createDbName: 'Nombre de la base de datos',
    createDbNamePlaceholder: 'Nombre de la BD',
    createDbFile: 'Archivo SQL (.sql)',
    sqlAutoGenerated: '(generado desde OpenAPI)',
    createDbButton: 'Crear BD',
    successTitle: 'Conectado a la base de datos',
    successMessage: 'Se ha conectado satisfactoriamente. ID de conexion: {id}',
    errorLoadingTables: 'Error cargando tablas',
    errorLoadingTablesMessage: 'No se pudieron cargar las tablas de la base de datos.',
    errorCreateDb: 'Error al crear base de datos',
    host: 'Servidor',
    port: 'Puerto',
    database: 'Base de datos',
    jdbcUrl: 'URL de conexión JDBC de Oracle',
    noUseDatabase: 'No usar la base de datos',
    noDatabaseInfo: `Se ha seleccionado el modo de generación sin base de datos.
    
    Esto implica que el arquetipo que se generará no tendrá entidades y no se podrán mapear los campos.
    Esto no es un proceso reversible, si se quiere poder incluir entidades se tendrá que repetir el proceso.
    
    Este modo sólo se recomienda si no se dispone de una conexión a base de datos, dado que se puede generar el arquetipo con entidades, y deshabilitar la conexión a base de datos posteriomente.
    `,
    jdbcUrlCheckbox: 'Conexión a BBDD por cadena TNS',
    user: 'Usuario DBA',
    pass: 'Contraseña',
    connect: 'Conectar',
    connecting: 'Conectando',
    loadAllSchemas: 'Carga de todos los esquemas',
    loadTablePrefixes: 'Prefijos de las tablas a buscar',
    includeTablePrefix: 'Añadir prefijo a las tablas',
    loadAdditionalSchemas: 'Esquemas adicionales a leer',
    loadAdditionalSchema: 'Añadir esquema adicional',
    hide: 'ocultar detalles',
    show: 'detalles de la conexión',
    javaUser: 'Usuario Java',
    javaPassword: 'Contraseña',
    info: {
      host: `Servidor oracle al que conectar.<br/><br/>
      Con servidor, puerto y bbdd se formará la cadena de conexión.<br/><br/>
      Todo en minúsculas.<br/><br/>
      Ejemplos:<br/>
          - desabd11<br/>
          - 10.80.79.162<br/>`,
      jdbcUrl: `<div style="text-align: start">Cadena de conexión de la BBDD Oracle a la que conectar.<br/><br/>
      El service name se especifica con <strong style="color: yellow">/</strong> y el SID con <strong style="color: yellow">:</strong>      
      <br/>
      <br/>
      Formatos<br/>
      - Si es por SID:          jdbc:oracle:thin:@servidor:puerto<strong style="color: yellow">:</strong>base_de_datos<br/>
      <br/>
      - Si es por service name: jdbc:oracle:thin:@servidor:puerto<strong style="color: yellow">/</strong>base_de_datos<br/>
      <br/>
      - También se puede especificar la cadena TNS completa: jdbc:oracle:thin:@(DESCRIPTION =(ADDRESS_LIST =(ADDRESS =(PROTOCOL=TCP)(HOST=ejemplo.com)(PORT=1521)))(CONNECT_DATA=(SID=EJEMPLOSID)(GLOBAL_NAME=SID.WORLD)(SERVER=DEDICATED)))
      <br/>
      <br/>
      Más información, en la documentación de Oracle:<br/>
      <a href="https://docs.oracle.com/cd/B28359_01/java.111/b31224/urls.htm#BEIDHCBA" target=”_blank”>https://docs.oracle.com/cd/B28359_01/java.111/b31224/urls.htm#BEIDHCBA</a></div>`,
      database: `Service name o SID de la base de datos Oracle a la que conectar, dependiendo de la opción escogida.<br/><br/>
      Con servidor, puerto y service name/SID se formará la cadena de conexión.<br/><br/>
      Todo en minúsculas.<br/><br/>
      Ejemplos:<br/>
          - desabd11<br/>
          - XE`,
      prefix: `Prefijo de las tablas que se buscarán.<br/><br/>
      Se obtiene por defecto del usuario de la base de datos si este sigue el formato de normativa.<br/><br/>
      Por ejemplo, JAPI buscará sólo aquellas tablas del tipo JAPI_%, omitiendo tablas del tipo: TEST_JAPI o JAPITEST.<br/><br/>
      Si se deja vacío, no aplicará esta restricción, y buscará todas las tablas asociadas al usuario de base de datos.`,
      extra_schemas: `Esquemas adicionales sobre los que se buscará.<br/><br/>
      Por defecto, se buscará siempre las tablas y recursos asociadas al esquema que realiza la búsqueda, aquí se pueden definir esquemas adicionales que se añadirán a la búsqueda.<br/><br/>
      IMPORTANTE: Salvo excepción justificada, un API deberá acceder únicamente a un esquema, por lo que 
      no debería ser necesario añadir esquemas adicionales, se proporciona esta opción para estos casos especiales.`,
      loadAllSchemas: `Carga todas las tablas de todos los esquemas.<br/><br/>
      Atención: ¡¡Esto hará que tarde bastante mas!!<br/><br/>
      Se usa sólo cuando un API usa tablas de varios esquemas o usuarios DBA (de la misma BBDD).`,
      user: 'El usuario de conexión debe ser un dba, normalmente dba_ + el código POAPS',
      javaUser: `Para utilizar el API que se quiere generar, al menos en entornos de validación y producción, debe emplearse, por seguridad, un usuario que no sea el DBA.
      <br/>Normalmente, este usuario será similar a java_poaps, siendo el usuario dba, dba_poaps.
      <br/><br/>Es recomendable incluirlo siempre, pero especialmente si se emplean varios esquemas, para poder comprobar con el usuario correcto que los sinónimos públicos estén bien configurados.
      <br/><br/>
      Si se incluye, se generarán las properties usando este usuario, y no el usuario dba.`,
    },
  },
  resources: {
    title: 'Recursos REST',
    importApiDefinition: 'Importar definición del API',
    importApiDefinitionDisabled: 'Antes de importar la definición del API, es necesario rellenar los datos de la aplicación así como haber realizado la conexión a base de datos, o indicado que no se va a hacer uso de ella',
    createByDB: 'Crear la definición del API a partir de tablas de BBDD',
    asyncapiTitle: 'Recursos Async',
    asyncapiTablesWithNoDatabase1: 'Se ha cargado un fichero AsyncAPI que contiene una o más tablas relacionadas, pero no se ha conectado con una base de datos.',
    asyncapiTablesWithNoDatabase2: 'Estas tablas no pueden usarse en la generación, por lo que son ignoradas, y no se muestran dentro de Recursos Async.',
    asyncapiTablesWithNoDatabase3: 'Si quiere hacer uso de ellas, debe de establecer una conexión con una base de datos válida.',
  },
  resourcesItem: {
    controllerName: 'Nombre del controlador',
    controllerNameRequired: 'El nombre del controlador no puede estar vacío',
    mapping: 'Mapping',
    mappingRequired: 'El mapeo (recurso) no puede estar vacío',
    dbEntity: 'Entidad de la base de datos',
    additionalEntities: 'Entidades adicionales a cargar',
    additionalEntitiesPlaceholder: 'Entidades adicionales',
    operations: 'Operaciones',
    selectDbEntity: 'Selecciona entidad de la base de datos',
  },
  endpointAttributesTable: {
    primaryKey: 'Clave primaria',
    validations: 'Validaciones',
    api_controller: 'Controlador API',
    name: 'Nombre',
    type: 'Tipo',
    active: 'Activo',
    entity: 'Entidad',
    swaggerType: ' del Swagger',
    anonymization: 'Anonimización',
  },
  endpointAttribute: {
    notMapped: 'No mapeado',
    viewNote: 'NOTA: Se está mapeando una vista no materializada. En este caso, los campos numéricos se mapean como Float pero se devolverán con el tipo de la derecha, tal y como se especifica en el Swagger u OpenAPI.',
    readOnlyTooltip: 'readOnly: no disponible en request body',
    writeOnlyTooltip: 'writeOnly: no disponible en response',
    objectList: 'Listado de objetos',
    simpleObjectList: 'Listado de objetos simples',
    selectDbEntity: 'Selecciona entidad de la base de datos',
    noEntitiesLoaded: 'No se han cargado entidades o no se han podido mostrar',
    anonymizationNone: 'Ninguna',
    lockedByEndpoint: 'Mapeado desde otro endpoint',
    entityMappingTypeMsg: 'A este nivel no se puede relacionar con una entidad, se procede a utilizar su identificador.',
    responseFile: 'La respuesta devuelve un fichero',
    responseFileHeader: 'Respuesta',
    responseHeader: 'Cuerpo de la respuesta',
    additionalRequired: `Se ha mapeado %replace1%, pero en la generación se empleará %replace2%, dado que es un campo que se tendrá que obtener de una relación.<br/><br/>
    El campo relacionado pertenece a la tabla "%replace3%".<br/>
    Para que este mapeo funcione correctamente se van a generar los Servicios, DAOs y Domains para esta tabla.`,
  },
  endpointDetails: {
    swaggerDeleteInfo: 'Los métodos DELETE no tienen response mapping y solo devuelven el objeto Result',
  },
  dashboard: {
    tablesWithoutPKLabel: '%replace1% de %replace2% tablas encontradas (vistas excluídas), no tienen una clave primaria. Estas tablas no se listarán y no se podrán mapear sus campos, dado que una clave primaria es un requisito para todas las tablas. Son las siguientes:',
    tablesWithoutPKLabelWithoutNumberOfTables: 'Se han detectado una serie de tablas sin clave primaria. Estas tablas no se listarán y no se podrán mapear sus campos, dado que una clave primaria es un requisito para todas las tablas. Son las siguientes:',
  },
  asyncApiVisualizer: {
    operationIdentifier: 'Identificador de la operación',
    relatedTables: 'Tablas relacionadas: ',
    additionalTables1: 'Tablas adicionales a cargar',
    additionalTables2: 'Necesarias para las relaciones, pero no cargadas en los servicios',
    nonExistingTables1: 'Las tablas que se listan a continuación estaban en el fichero AsyncAPI, pero al realizar la conexión con la base de datos, no se han recuperado, por lo que no es posible usarlas.',
    nonExistingTables2: 'Compruebe que la conexión a base de datos es la que se quiere usar y que el nombre y esquema de las tablas sean el correcto:',
    loadingTables: 'Cargando el listado de tablas, dependiendo de los esquemas cargados, o lo grandes que sean estos, puede tardar un poco. Si ha cargado todos los esquemas sin seleccionar ningún prefijo, podría tardar varios minutos, dado que cargará todas las tablas de todos los esquemas',
  },
  anonymizationConfig: {
    title: 'Configuraci\u00f3n de Anonimizaci\u00f3n - Swap Lists',
    description: 'Crea listas de valores de intercambio (swap) para usar en los campos con anonimizaci\u00f3n de tipo swap.',
    addList: 'A\u00f1adir lista',
    deleteList: 'Eliminar',
    addValue: 'A\u00f1adir',
    newListPlaceholder: 'Nombre de la nueva lista (ej: cities, names)',
    newValuePlaceholder: 'Nuevo valor...',
    listExists: 'Ya existe una lista con ese nombre',
    builtInTitle: 'Tipos predefinidos',
    customListsTitle: 'Listas personalizadas',
    createNewList: 'Crear nueva lista',
    addValuesTo: 'Añadir valores a',
  },
};
