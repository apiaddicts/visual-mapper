export default {
  emptyList: 'The list is empty',
  loading: 'Receiving and loading information',
  loadingTables: 'Loading the table list. Depending on the loaded schemas or their size, it may take a while. If you loaded all schemas without selecting any prefix, it could take several minutes as it will load all tables from all schemas.',
  menu: {
    application: 'Application',
    connection: 'Connection details',
    resources: 'REST Resources',
    asyncapi: 'Async Resources',
  },
  header: {
    title: 'VISUAL MAPPER ',
    export: 'Export configuration',
    import: 'Import configuration',
    generate: 'Generate code',
    generateController: 'Generate controller code',
    collapse: 'Hide or show menu',
    token: 'Refresh token (only if authentication fails)',
    tables: 'Reload tables (only if a relation or table is not shown)',
  },
  footer: {
    copy: 'Copyright © OpenDataSpace',
    status: {
      connection_error: `Some of the REST services do not have connectivity with the JWKS.

      The connection is being made from the client, which is this browser, meaning that probably from your network or VPN you do not have connection to the servers, the servers are not hosted on the same domain used by this web page.

      You can check the host used by the servers by clicking the blue icon located to the right of each section, please make sure your network connection has access to the domain loaded in these routes.`,
      modal: 'Check connectivity',
      retryButton: 'Retry connectivity',
      title: 'Microservices status',
      configGenerator: 'Config Generator Status',
      projectGenerator: 'Project Generator Status',
      wso2: 'WSO2 Status',
      success: 'Connectivity to all services is correct',
      error: `There seems to be a connectivity problem.
        Check that you are connected to the VPN and if this problem persists, your team lead should request access to the domain <http://apis.comunidad.madrid> on the VPN being used through the usual channels.
        You can try, while keeping this modal open, to disconnect the VPN and use the 'Retry connectivity' button. If connectivity is correct with the VPN removed, the problem is with your VPN.`,
    },
  },
  tables: {
    title: 'Select tables and verbs',
    search: 'Filter tables',
    searchVerbs: 'Select verbs',
  },
  application: {
    title: 'Application data',
    name: 'OpenAPI Name',
    description: 'Description',
    group: 'Java Package (e.g.: org.madrid.xxxx)',
    artifact: 'Artifact',
    version: 'Version (e.g.: 1.0.0)',
    packageName: 'Package Name',
    info: {
      name: 'The filename that will go in x-apigen-project.',
      description: 'OpenAPI description to generate, will go in x-apigen-project.',
      group: `Java package of the generated code.<br/><br/>
      Format: org.madrid.xxx<br/>
      All lowercase without spaces or accents<br/>
      Where:<br/><br/>
      xxxx is the project poaps code<br/><br/>
      Additional packages can be added if desired.<br/><br/>
      Examples:<br/>
      - org.madrid.sice<br/>
      - org.madrid.sice.alumnos`,
      version: `Application version<br/><br/>
      Format: nn.nn.nn<br/><br/>
      The first version will be 1.0.0<br/>
      The first digit, as best practice, should match the swagger or api version.`,
    },
    generationOptions: {
      title: 'Generation options',
      tests: 'Test generation',
      testsInfo: '<div style="text-align: start">This option enables test generation in the archetypes.<br/><br/>Tests will only be generated for the REST part of the API, not for async elements (related to AsyncAPI). Note that the "japi-starter-test" starter must be selected to enable this option.</div>',
      files: 'Generate example /files resources',
      filesInfo: `<div style="text-align: start">This option generates a files package with example classes for:
      <br/>
      - File upload
      <br/>
      - File download
      <br/>
      - File deletion <br/><br/>For a shared or temporary directory, uploading the file in parts (chunks), complete, in base 64...<br/><br/>These resources are provided as examples and should be removed from the application or included in the OpenAPI file to be used.<br/><br/>The files package has no dependency on any other part of the application and can be removed without issue.
      </div>`,
    },
    kafka_credentials: {
      title: 'Kafka connection credentials',
      info: `You have selected the Kafka starter, which means you want to connect to an Apache Kafka installation.<br/><br/>
      If so, credentials will be required to make this connection. These can be entered here and will be generated encrypted in the properties files.<br/><br/>
      Since different credentials may be needed for each deployment environment, you can include all of them here.<br/><br/>
      This does not mean these credentials cannot be modified later or that their inclusion is mandatory.<br/><br/>
      If not included, they will be generated pointing to environment variables (KAFKA_USER, KAFKA_PASSWORD).`,
    },
    starters: {
      title: 'Starters to include in the application',
      info: `A starter is, in JAPI and other Spring Boot projects, a set of dependencies added <br/>
      to perform a specific function. <br/><br/>
      This set of dependencies is distributed unified as a starter.<br/>
      For example, in Spring Boot there is 'spring-boot-starter-web' which downloads and enables <br/>
      all functionality related to REST servers in Spring Boot.<br/><br/>
      Similarly, JAPI provides a series of starters that must be selected and added.`,
      non_included: 'No starters have been included',
      default: `These default configuration options select the minimum necessary starters for each described function.<br/><br/>
      You can select one of these options and complete it with the necessary ones by clicking the 'Edit starters' button.`,
    },
    entities: {
      additional: `Generates domain classes, DAO classes and service classes for the entities indicated here.<br/>
      This is only used for entities that:<br/><br/>
      - Are NOT related to the main table <br/>of this resource in the database<br/>
      - Are NOT used in another resource of this API<br/><br/>

      If an entity is defined that is used in another API resource, it will be ignored because the domain classes, DAOs and services will already be created for that resource.`,
    },
    targetFramework: {
      title: 'Target generator',
      python: 'Python apigen',
      springboot: 'Spring Boot apigen',
      groupId: 'Group ID',
      groupIdHint: 'Reversed domain in lowercase',
      artifactId: 'Artifact ID',
      artifactIdHint: 'One word, lowercase, no hyphens',
      basePackage: 'Base package (auto)',
    },
  },
  generateSql: {
    autoLoaded: 'OpenAPI automatically loaded from current context',
    fileLabel: 'OpenAPI file (YAML / JSON)',
    fileHint: 'Upload a clean OpenAPI (without x-apigen-* extensions)',
    tablePrefix: 'Table prefix',
    tablePrefixResult: 'Result:',
    relationsPrefix: 'Relation table prefix',
    relationsPrefixHint: 'Only for ManyToMany relations (arrays with $ref).',
    relationsPrefixResult: 'Result:',
    dbSchema: 'DB Schema',
    dbSchemaHint: '(optional — PostgreSQL only)',
    dbSchemaPlaceholder: 'e.g.: public — leave empty for MySQL/MariaDB',
    preview: 'Preview',
    previewBtn: 'Preview',
    downloadBtn: 'Download .sql',
    useBtn: 'Use in Create DB',
    noSchemas: 'No schemas found in the document.',
    parseError: 'Error parsing file: {msg}',
    generateError: 'Error generating SQL: {msg}',
  },
  connection: {
    title: 'Database connection details',
    modeConnect: 'Connect to existing DB',
    modeCreate: 'Create DB from SQL',
    dbType: 'Database type',
    schema: 'Schema',
    requiredFields: 'Fields marked with * are required',
    createDbInfo: 'Upload a .sql file with CREATE TABLE statements to create the database',
    createDbName: 'Database name',
    createDbNamePlaceholder: 'Database name',
    createDbFile: 'SQL file (.sql)',
    sqlAutoGenerated: '(generated from OpenAPI)',
    createDbButton: 'Create DB',
    successTitle: 'Connected to database',
    successMessage: 'Successfully connected. Connection ID: {id}',
    errorLoadingTables: 'Error loading tables',
    errorLoadingTablesMessage: 'Could not load database tables.',
    errorCreateDb: 'Error creating database',
    host: 'Server',
    port: 'Port',
    database: 'Database',
    jdbcUrl: 'Oracle JDBC connection URL',
    noUseDatabase: 'Do not use database',
    noDatabaseInfo: `No-database generation mode has been selected.

    This means the generated archetype will not have entities and fields cannot be mapped.
    This is not a reversible process. If you want to include entities you will have to repeat the process.

    This mode is only recommended if you do not have a database connection, since you can generate the archetype with entities and disable the database connection later.
    `,
    jdbcUrlCheckbox: 'Connect to DB via TNS string',
    user: 'DBA User',
    pass: 'Password',
    connect: 'Connect',
    connecting: 'Connecting',
    loadAllSchemas: 'Load all schemas',
    loadTablePrefixes: 'Table prefixes to search',
    includeTablePrefix: 'Add prefix to tables',
    loadAdditionalSchemas: 'Additional schemas to read',
    loadAdditionalSchema: 'Add additional schema',
    hide: 'hide details',
    show: 'connection details',
    javaUser: 'Java User',
    javaPassword: 'Password',
    info: {
      host: `Oracle server to connect to.<br/><br/>
      With server, port and database the connection string will be formed.<br/><br/>
      All lowercase.<br/><br/>
      Examples:<br/>
          - desabd11<br/>
          - 10.80.79.162<br/>`,
      jdbcUrl: `<div style="text-align: start">Oracle DB connection string.<br/><br/>
      The service name is specified with <strong style="color: yellow">/</strong> and the SID with <strong style="color: yellow">:</strong>
      <br/>
      <br/>
      Formats<br/>
      - By SID:          jdbc:oracle:thin:@server:port<strong style="color: yellow">:</strong>database<br/>
      <br/>
      - By service name: jdbc:oracle:thin:@server:port<strong style="color: yellow">/</strong>database<br/>
      <br/>
      - Full TNS string can also be specified: jdbc:oracle:thin:@(DESCRIPTION =(ADDRESS_LIST =(ADDRESS =(PROTOCOL=TCP)(HOST=example.com)(PORT=1521)))(CONNECT_DATA=(SID=EXAMPLESID)(GLOBAL_NAME=SID.WORLD)(SERVER=DEDICATED)))
      <br/>
      <br/>
      More information in the Oracle documentation:<br/>
      <a href="https://docs.oracle.com/cd/B28359_01/java.111/b31224/urls.htm#BEIDHCBA" target="_blank">https://docs.oracle.com/cd/B28359_01/java.111/b31224/urls.htm#BEIDHCBA</a></div>`,
      database: `Service name or SID of the Oracle database to connect to, depending on the chosen option.<br/><br/>
      With server, port and service name/SID the connection string will be formed.<br/><br/>
      All lowercase.<br/><br/>
      Examples:<br/>
          - desabd11<br/>
          - XE`,
      prefix: `Prefix of the tables to search for.<br/><br/>
      It is obtained by default from the database user if it follows the standard format.<br/><br/>
      For example, JAPI will only search for tables of the type JAPI_%, omitting tables of the type: TEST_JAPI or JAPITEST.<br/><br/>
      If left empty, this restriction will not apply, and all tables associated with the database user will be searched.`,
      extra_schemas: `Additional schemas to search on.<br/><br/>
      By default, tables and resources associated with the schema performing the search will always be searched. Additional schemas can be defined here to add to the search.<br/><br/>
      IMPORTANT: Except for justified exceptions, an API should only access one schema, so
      it should not be necessary to add additional schemas. This option is provided for these special cases.`,
      loadAllSchemas: `Loads all tables from all schemas.<br/><br/>
      Warning: This will take much longer!<br/><br/>
      Only use when an API uses tables from multiple schemas or DBA users (from the same DB).`,
      user: 'The connection user must be a DBA, usually dba_ + the POAPS code',
      javaUser: `To use the API to be generated, at least in validation and production environments, a non-DBA user should be used for security.
      <br/>Usually, this user will be similar to java_poaps, with the DBA user being dba_poaps.
      <br/><br/>It is recommended to always include it, but especially if multiple schemas are used, to verify with the correct user that public synonyms are properly configured.
      <br/><br/>
      If included, the properties will be generated using this user, not the DBA user.`,
    },
  },
  resources: {
    title: 'REST Resources',
    importApiDefinition: 'Import API definition',
    importApiDefinitionDisabled: 'Before importing the API definition, you need to fill in the application data and either connect to a database or indicate that you will not use one',
    createByDB: 'Create API definition from database tables',
    asyncapiTitle: 'Async Resources',
    asyncapiTablesWithNoDatabase1: 'An AsyncAPI file has been loaded that contains one or more related tables, but no database connection has been established.',
    asyncapiTablesWithNoDatabase2: 'These tables cannot be used in generation, so they are ignored and not shown in Async Resources.',
    asyncapiTablesWithNoDatabase3: 'If you want to use them, you must establish a connection with a valid database.',
  },
  resourcesItem: {
    controllerName: 'Controller name',
    controllerNameRequired: 'Controller name cannot be empty',
    mapping: 'Mapping',
    mappingRequired: 'Mapping (resource) cannot be empty',
    dbEntity: 'Database entity',
    additionalEntities: 'Additional entities to load',
    additionalEntitiesPlaceholder: 'Additional entities',
    operations: 'Operations',
    selectDbEntity: 'Select database entity',
  },
  endpointAttributesTable: {
    primaryKey: 'Primary key',
    validations: 'Validations',
    api_controller: 'API Controller',
    name: 'Name',
    type: 'Type',
    active: 'Active',
    entity: 'Entity',
    swaggerType: ' from Swagger',
    anonymization: 'Anonymization',
  },
  endpointAttribute: {
    notMapped: 'Not mapped',
    viewNote: 'NOTE: A non-materialized view is being mapped. In this case, numeric fields are mapped as Float but will be returned with the type on the right, as specified in the Swagger or OpenAPI.',
    readOnlyTooltip: 'readOnly: not available in request body',
    writeOnlyTooltip: 'writeOnly: not available in response',
    objectList: 'Object list',
    simpleObjectList: 'Simple object list',
    selectDbEntity: 'Select database entity',
    noEntitiesLoaded: 'No entities loaded or could not be displayed',
    anonymizationNone: 'None',
    lockedByEndpoint: 'Mapped from another endpoint',
    entityMappingTypeMsg: 'At this level it cannot be related to an entity, its identifier will be used instead.',
    responseFile: 'The response returns a file',
    responseFileHeader: 'Response',
    responseHeader: 'Response body',
    additionalRequired: `%replace1% has been mapped, but %replace2% will be used in generation, since it is a field that must be obtained from a relation.<br/><br/>
    The related field belongs to the table "%replace3%".<br/>
    For this mapping to work correctly, the Services, DAOs and Domains for this table will be generated.`,
  },
  endpointDetails: {
    swaggerDeleteInfo: 'DELETE methods have no response mapping and only return the Result object',
  },
  dashboard: {
    tablesWithoutPKLabel: '%replace1% of %replace2% tables found (views excluded) do not have a primary key. These tables will not be listed and their fields cannot be mapped, since a primary key is a requirement for all tables. They are:',
    tablesWithoutPKLabelWithoutNumberOfTables: 'A number of tables without primary key have been detected. These tables will not be listed and their fields cannot be mapped, since a primary key is a requirement for all tables. They are:',
  },
  asyncApiVisualizer: {
    operationIdentifier: 'Operation identifier',
    relatedTables: 'Related tables: ',
    additionalTables1: 'Additional tables to load',
    additionalTables2: 'Needed for relations, but not loaded in services',
    nonExistingTables1: 'The tables listed below were in the AsyncAPI file, but when connecting to the database, they were not retrieved, so it is not possible to use them.',
    nonExistingTables2: 'Check that the database connection is the one you want to use and that the name and schema of the tables are correct:',
    loadingTables: 'Loading the table list. Depending on the loaded schemas or their size, it may take a while. If you loaded all schemas without selecting any prefix, it could take several minutes as it will load all tables from all schemas.',
  },
  anonymizationConfig: {
    title: 'Anonymization Config - Swap Lists',
    description: 'Create swap value lists to use in fields with swap-type anonymization.',
    addList: 'Add list',
    deleteList: 'Delete',
    addValue: 'Add',
    newListPlaceholder: 'New list name (e.g. cities, names)',
    newValuePlaceholder: 'New value...',
    listExists: 'A list with that name already exists',
    builtInTitle: 'Built-in types',
    customListsTitle: 'Custom lists',
    createNewList: 'Create new list',
    addValuesTo: 'Add values to',
  },
};
