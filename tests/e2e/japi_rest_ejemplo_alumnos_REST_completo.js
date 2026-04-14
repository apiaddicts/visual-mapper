/* eslint-disable no-promise-executor-return */
/* eslint-disable no-loss-of-precision */
const puppeteer = require('puppeteer'); // v23.0.0 or later

(async () => {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--enable-automation', '--start-maximized', '--allow-file-access-from-files', '--disable-file-system'],
  });
  const pages = await browser.pages();
  const page = pages[0];
  const timeout = 15000;
  let locators = [];

  // Datos de configuración usados en JapiMapping
  const JAPIMAPPING_URI = 'http://localhost:8080';
  const DB_HOST = '172.19.9.31';
  const DB_NAME = 'dscore';
  const ARTIFACT_ID = 'test_rest_test';
  const ARTIFACT_DESCRIPTION = 'Test';
  const VERSION = '1.0.0';
  const DBA_USER = 'dba_japi';
  const DBA_PASS = 'sis';
  const JAVA_USER = 'java_japi';
  const JAVA_PASSWORD = 'sis';

  page.setDefaultTimeout(timeout);
  {
    const targetPage = page;
    await targetPage.setViewport({
      width: 1458,
      height: 703,
    });
  }
  {
    const targetPage = page;
    await targetPage.goto(JAPIMAPPING_URI);
    console.log('Página web cargada');
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#applicationNameInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(ARTIFACT_ID);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#descriptionInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(ARTIFACT_DESCRIPTION);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#versionInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(VERSION);
    console.log('Rellenados los datos de la aplicación');
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#HostInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(DB_HOST);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#DatabaseInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(DB_NAME);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#DBAUserInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(DBA_USER);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#DBAPassInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(DBA_PASS);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#JavaUserInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(JAVA_USER);
  }
  {
    const targetPage = page;
    locators = [
      targetPage.locator('#JavaPassInput'),
    ];

    await puppeteer.Locator.race(locators).setTimeout(timeout).click();
    await puppeteer.Locator.race(locators).setTimeout(timeout).fill(JAVA_PASSWORD);
    console.log('Rellenados los datos de la base de datos');
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([targetPage.locator('#DBConnectButton')]).setTimeout(timeout).click();
  }
  {
    console.log('Conectados a la base de datos');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(Importar definición del API)'),
      targetPage.locator('div.c-resources button'),
      targetPage.locator('::-p-xpath(/html/body/div[1]/div/div[3]/div/div/div/div[2]/div[3]/div[1]/div[2]/button)'),
      targetPage.locator(':scope >>> div.c-resources button'),
      targetPage.locator('::-p-text(Importar definición)'),
    ])
      .setTimeout(timeout)
      .click();
    console.log('Importando definición');
  }
  {
    await page.$('#file-openapi');
    const inputUploadHandle = await page.$('#file-openapi');
    await inputUploadHandle.uploadFile('./japi_rest_ejemplo_alumnos_v1.yaml');
  }
  {
    console.log('Fichero subido');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#ImportDefinition'),
    ])
      .setTimeout(timeout)
      .click();
    console.log('Fichero procesado, se abre la interfaz de los endpoints a mapear');
    await new Promise((r) => setTimeout(r, 10000));
  }
  {
    // await new Promise((r) => setTimeout(r, 2000));
    console.log('Se va a seleccionar la tabla de AlumnosCompletoController');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('div.js-controller-AlumnosCompletoController > div:nth-of-type(4) div.multiselect__tags'),
      targetPage.locator('div.js-controller-AlumnosCompletoController > div:nth-of-type(4) div.multiselect__tags'),
      targetPage.locator('::-p-xpath(/html/body/div[1]/div/div[3]/div/div/div/div/div[2]/div[4]/div[2]/div[1]/div/div[1]/div[1]/div[4]/div/div[2])'),
      targetPage.locator(':scope >>> div.js-controller-AlumnosCompletoController > div:nth-of-type(4) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
    console.log('Se ha clicado en el selector de tablas de AlumnosCompletoController');
  }
  {
    console.log('Se va a seleccionar la tabla de AlumnosCompletoController');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('div.js-controller-AlumnosCompletoController > div:nth-of-type(4) div.multiselect__tags'),
      targetPage.locator('::-p-xpath(/html/body/div[1]/div/div[3]/div/div/div/div/div[2]/div[4]/div[2]/div[1]/div/div[1]/div[1]/div[4]/div/div[2])'),
      targetPage.locator(':scope >>> div.js-controller-AlumnosCompletoController > div:nth-of-type(4) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
    console.log('Se ha clicado en el selector de tablas de AlumnosCompletoController');
  }
  {
    console.log('Se va a seleccionar la tabla de AlumnosCompletoController de la lista');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('div.js-controller-AlumnosCompletoController > div:nth-of-type(4) li:nth-of-type(1) > span'),
      targetPage.locator('::-p-xpath(//*[@id=\\"AlumnosCompletoControllerTableResourceInput-0\\"]/span)'),
      targetPage.locator(':scope >>> div.js-controller-AlumnosCompletoController > div:nth-of-type(4) li:nth-of-type(1) > span'),
    ])
      .setTimeout(timeout)
      .click();
    console.log('Se ha seleccionado la tabla Alumno para AlumnosCompletoController de la lista');
  }
  {
    console.log('Se abre la sección del recurso POST /alumnos/completo');
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('::-p-aria(POST /alumnos/completo)'),
      targetPage.locator('div.c-resource__item'),
      targetPage.locator('::-p-xpath(/html/body/div[1]/div/div[3]/div/div/div/div/div[2]/div[4]/div[2]/div[1]/div/div[1]/div[1]/div[6]/div/div/div[1])'),
      targetPage.locator(':scope >>> div.c-resource__item'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) div.multiselect__tags'),
      // targetPage.locator('::-p-xpath(//*[@id=\\"collapse-post-/alumnos/completo\\"]/div/div[1]/div/div/div/div[2]/div/div[2]/div/div/div[1]/div/div[2])'),
      // targetPage.locator(':scope >>> #collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) li:nth-of-type(5) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(3) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(3) > div > div > div:nth-of-type(1) li:nth-of-type(6) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(4) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(4) > div > div > div:nth-of-type(1) li:nth-of-type(7) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(5) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(5) > div > div > div:nth-of-type(1) li:nth-of-type(4) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(6) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(6) > div > div > div:nth-of-type(1) li:nth-of-type(8) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(7) > div > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(7) > div > div > div:nth-of-type(1) li:nth-of-type(13) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  
  // AlumnosControllerCompleto --> Body --> direccion_alumno
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(8) > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(8) > div > div:nth-of-type(1) li:nth-of-type(3) > span > span'),
    ])
      .setTimeout(timeout)
      .click();
  }

  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(3) > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(3) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div.multiselect__content-wrapper > li:nth-of-type(1)'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(4) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div.multiselect__content-wrapper > li:nth-of-type(1) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(5) > div > div:nth-child(2) > div > div > div:nth-child(1) > div > div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-child(1) > div > div > div > div.p-1 > div > div:nth-child(8) > div > div:nth-child(5) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > div.multiselect__content-wrapper > li:nth-of-type(1) > span'),
    ])
      .setTimeout(timeout)
      .click();
  }

  // AlumnosControllerCompleto --> Body --> direccion_tutor
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(9) > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(9) > div > div:nth-of-type(1) li:nth-of-type(4) > span > span'),
    ])
      .setTimeout(timeout)
      .click();
  }

  // AlumnosControllerCompleto --> Body --> asignaturas
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(10) > div > div:nth-of-type(1) div.multiselect__tags'),
    ])
      .setTimeout(timeout)
      .click();
  }
  {
    const targetPage = page;
    await puppeteer.Locator.race([
      targetPage.locator('#collapse-post-\\/alumnos\\/completo > div > div:nth-of-type(1) div.p-1 > div > div:nth-of-type(10) > div > div:nth-of-type(1) li:nth-of-type(2) > span > span'),
    ])
      .setTimeout(timeout)
      .click();
  }

  await new Promise((r) => setTimeout(r, 1000000));
  
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
