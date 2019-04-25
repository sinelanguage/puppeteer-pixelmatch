const puppeteer = require("puppeteer");
const expect = require("chai").expect;
const fs = require("fs");
const CONSTANTS = require("../src/constants");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");

const { TEST_DIR, TEST_ROUTE, ORIGINAL_DIR, TEST_DIFFERENT_ROUTE } = CONSTANTS;

//mocha -g 'take'
//mocha -g 'compare'
// - page is a reference to the Puppeteer page.
// - route is the path you're loading, which I'm using to name the file.
// - filePrefix is either "wide" or "narrow", since I'm automatically testing both.
async function takeAndCompareScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName = filePrefix + "/" + (route ? route : "index");

  // Start the browser, go to that page, and take a screenshot.
  await page.goto(TEST_ROUTE);
  await page.screenshot({ path: `${TEST_DIR}/${fileName}.png` });

  // Test to see if it's right.
  return compareScreenshots(fileName);
}

async function takeOriginalScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName = filePrefix + "/" + (route ? route : "index");

  // Start the browser, go to that page, and take a screenshot.
  await page.goto(TEST_DIFFERENT_ROUTE);
  await page.screenshot({ path: `${ORIGINAL_DIR}/${fileName}.png` });
}

function compareScreenshots(fileName) {
  return new Promise((resolve, reject) => {
    const img1 = fs
      .createReadStream(`${TEST_DIR}/${fileName}.png`)
      .pipe(new PNG())
      .on("parsed", doneReading);
    const img2 = fs
      .createReadStream(`${ORIGINAL_DIR}/${fileName}.png`)
      .pipe(new PNG())
      .on("parsed", doneReading);

    let filesRead = 0;
    function doneReading() {
      // Wait until both files are read.
      if (++filesRead < 2) return;

      // The files should be the same size.
      expect(img1.width, "image widths are the same").equal(img2.width);
      expect(img1.height, "image heights are the same").equal(img2.height);

      // Do the visual diff.
      const diff = new PNG({ width: img1.width, height: img2.height });
      diff.pack().pipe(fs.createWriteStream(`${TEST_DIR}/${fileName}diff.png`));

      const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        img1.width,
        img1.height,
        { threshold: 0.1 },
      );

      // The files should look the same.
      expect(numDiffPixels, "number of different pixels").equal(0);
      resolve();
    }
  });
}

describe("take original screenshots", function() {
  let browser, page;

  // This is ran when the suite starts up.
  before(async function() {
    // This is where you would substitute your python or Express server or whatever.
    // polyserve = await startServer({port:4000});

    // Create the test directory if needed. This and the ORIGINAL_DIR
    // variables are global somewhere.
    if (!fs.existsSync(ORIGINAL_DIR)) fs.mkdirSync(ORIGINAL_DIR);

    // And its wide screen/small screen subdirectories.
    if (!fs.existsSync(`${ORIGINAL_DIR}/wide`))
      fs.mkdirSync(`${ORIGINAL_DIR}/wide`);
    if (!fs.existsSync(`${ORIGINAL_DIR}/narrow`))
      fs.mkdirSync(`${ORIGINAL_DIR}/narrow`);
  });

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  // Wide screen tests!
  describe("wide screen", function() {
    beforeEach(async function() {
      return page.setViewport({ width: 800, height: 600 });
    });
    it("/view1", async function() {
      return takeOriginalScreenshot(page, "view1", "wide");
    });
    // And your other routes, 404, etc.
  });

  // Narrow screen tests are the same, but with a different viewport.
  describe("narrow screen", function() {
    beforeEach(async function() {
      return page.setViewport({ width: 375, height: 667 });
    });
    it("/view1", async function() {
      return takeOriginalScreenshot(page, "view1", "narrow");
    });
    // And your other routes, 404, etc.
  });
});

describe("compare new screenshots", function() {
  let browser, page;

  // This is ran when the suite starts up.
  before(async function() {
    // This is where you would substitute your python or Express server or whatever.
    // polyserve = await startServer({port:4000});

    // Create the test directory if needed. This and the ORIGINAL_DIR
    // variables are global somewhere.
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR);

    // And its wide screen/small screen subdirectories.
    if (!fs.existsSync(`${TEST_DIR}/wide`)) fs.mkdirSync(`${TEST_DIR}/wide`);
    if (!fs.existsSync(`${TEST_DIR}/narrow`))
      fs.mkdirSync(`${TEST_DIR}/narrow`);
  });

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  // Wide screen tests!
  describe("wide screen", function() {
    beforeEach(async function() {
      return page.setViewport({ width: 800, height: 600 });
    });
    it("/view1", function(done) {
      takeAndCompareScreenshot(page, "view1", "wide").then(done);
    }).timeout(5000);
    // And your other routes, 404, etc.
  });

  // Narrow screen tests are the same, but with a different viewport.
  describe("narrow screen", function() {
    beforeEach(async function() {
      return page.setViewport({ width: 375, height: 667 });
    });
    it("/view1", function(done) {
      takeAndCompareScreenshot(page, "view1", "narrow").then(done);
    }).timeout(5000);
    // And your other routes, 404, etc.
  });
});
