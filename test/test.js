const puppeteer = require('puppeteer');
const expect = require('chai').expect;
const fs = require('fs');
const CONSTANTS = require('../src/constants');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');

const { TEST_DIR, TEST_ROUTE, ORIGINAL_DIR, TEST_DIFFERENT_ROUTE } = CONSTANTS;
const NissanUrls = require('../config/nissan.json');


// mocha -g 'take'
// mocha -g 'compare'

const URLS = [
  'https://wietse.loves.engineering/testing-promises-with-mocha-90df8b7d2e35',
  'http://www.adamwinick.com',
  'https://www.autoblog.com/',
  'https://news.ycombinator.com/',
  'http://www.synthtopia.com/',
  'https://www.matrixsynth.com/',
]

const OTHER_URLS = [
  'https://www.matrixsynth.com/',
  'https://wietse.loves.engineering/testing-promises-with-mocha-90df8b7d2e35',
  'http://www.adamwinick.com',
  'https://www.autoblog.com/',
  'https://news.ycombinator.com/',
  'http://www.synthtopia.com/',
]

 // Get the "viewport" of the page, as reported by the page.
 const dimensions = async(page) => await page.evaluate(() => {
  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
    deviceScaleFactor: window.devicePixelRatio
  };
});

async function takeAndCompareScreenshot(page, route, index, filePrefix) {
    let fileName = filePrefix + '/' + (index ? (index.charAt(0 === "/") && index.replace(/\//g, "-").substr(1)) : 'index');;
    let img2Width = 0;
    let img2Height = 0;
    await page.goto(route);
    await page.screenshot({path: `${TEST_DIR}/${fileName}.png`, fullPage: true});
    return compareScreenshots(fileName);
}

async function takeOriginalScreenshot(page, route, index, filePrefix) {
  let fileName = filePrefix + '/' + (index ? (index.charAt(0 === "/") && index.replace(/\//g, "-").substr(1)) : 'index');
  await page.goto(route);
  await page.screenshot({path: `${ORIGINAL_DIR}/${fileName}.png`, fullPage: true});
}

function compareScreenshots(fileName) {
  return new Promise((resolve, reject) => {
    const img1 = fs.createReadStream(`${TEST_DIR}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);
    const img2 = fs.createReadStream(`${ORIGINAL_DIR}/${fileName}.png`).pipe(new PNG()).on('parsed', doneReading);

    let filesRead = 0;
    function doneReading() {
      // Wait until both files are read.
      if (++filesRead < 2) return;

      // The files should be the same size.
      expect(img1.width, 'image widths are the same').equal(img2.width);
      expect(img1.height, 'image heights are the same').equal(img2.height);

      // Do the visual diff.
      const diff = new PNG({width: img1.width, height: img2.height});
      diff.pack().pipe(fs.createWriteStream(`${TEST_DIR}/${fileName}diff.png`));

      const numDiffPixels = pixelmatch(
          img1.data, img2.data, diff.data, img1.width, img1.height,
          {threshold: 0.1});

      // The files should look the same.
      expect(numDiffPixels, 'number of different pixels').equal(0);
      resolve();
    }
  });
}

describe('compare new screenshots', function() {
  let browser, page;

  // This is ran when the suite starts up.
  before(async function() {
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

    if (!fs.existsSync(`${TEST_DIR}/wide`)) fs.mkdirSync(`${TEST_DIR}/wide`);
    // if (!fs.existsSync(`${TEST_DIR}/narrow`)) fs.mkdirSync(`${TEST_DIR}/narrow`);
  });

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  describe('wide screen', async function() {
    beforeEach(function() {
      return page.setViewport({width: 800, height: 600});
    });
    await Promise.all(
      NissanUrls.pages.map((pageObj, i) => it(pageObj.url, async function() {
        await takeAndCompareScreenshot(page, `http://www.nissan.ca${pageObj.url}`, i, 'wide');
      }).timeout(0))
    )
  });

  // describe('narrow screen', async function() {
  //   beforeEach(function() {
  //     return page.setViewport({width: 375, height: 667});
  //   });
  //  await Promise.all(
  //   OTHER_URLS.map((url, i) => it(url, async function(done) {
  //     await takeAndCompareScreenshot(page, url, i, 'narrow').then(done);
  //   }).timeout(0))
  //  )
  // });
});

describe('take original screenshots', function() {
  let browser, page;

  before(async function() {
    if (!fs.existsSync(ORIGINAL_DIR)) fs.mkdirSync(ORIGINAL_DIR);
    if (!fs.existsSync(`${ORIGINAL_DIR}/wide`)) fs.mkdirSync(`${ORIGINAL_DIR}/wide`);
    // if (!fs.existsSync(`${ORIGINAL_DIR}/narrow`)) fs.mkdirSync(`${ORIGINAL_DIR}/narrow`);
    NissanUrls.pages.map(
      page => console.log(`http://www.nissan.ca${page.url}`)
    )
  });

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  describe('wide screen', function() {
    beforeEach(function() {
      return page.setViewport({width: 800, height: 600});
    });
    NissanUrls.pages.map(
      (pageObj, i) => it(pageObj.url, async function() {
        return takeOriginalScreenshot(page, `http://www.nissan.ca${pageObj.url}`, pageObj.url, 'wide');
      }).timeout(0)
    )
  });

  // describe('narrow screen', function() {
  //   beforeEach(function() {
  //     return page.setViewport({width: 375, height: 667});
  //   });
  //   URLS.map(
  //     (url, i) => it(url, async function() {
  //       return takeOriginalScreenshot(page, url, i, 'narrow');
  //     }).timeout(0)
  //   )
  // });
});