const puppeteer = require("puppeteer");
const expect = require("chai").expect;
const fs = require("fs");
const readline = require("readline");
const CONSTANTS = require("../src/constants");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const util = require("util");

const {
  TEST_DIR,
  TEST_ROUTE,
  ORIGINAL_DIR,
  TEST_DIFFERENT_ROUTE,
  TXT_FILE,
} = CONSTANTS;

// mocha -g 'take'
// mocha -g 'compare'

// read a txt file line by line;
const readFileLineByLine = async txtFile => {
  const URLS = fsreadFileSync(txtFile, "utf-8")
    .split("\n")
    .filter(Boolean);

  return Promise.resolve(URLS);
};

// - page is a reference to the Puppeteer page.
// - route is the path you're loading, which I'm using to name the file.
// - filePrefix is either "wide" or "narrow", since I'm automatically testing both.
async function takeScreenshotToCompare(page, route, index, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName =
    filePrefix +
    "/" +
    (index
      ? index.charAt(0 === "/") && index.replace(/\//g, "-").substr(1)
      : "index");

  // Start the browser, go to that page, and take a screenshot.
  await page.goto(route);
  await page.screenshot({
    path: `${TEST_DIR}/${fileName}.png`,
    fullPage: true,
  });

  // Test to see if it's right.
  return new Promise(res => res(fileName));
}

async function takeOriginalScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  let fileName =
    filePrefix +
    "/" +
    (index
      ? index.charAt(0 === "/") && index.replace(/\//g, "-").substr(1)
      : "index");

  // Start the browser, go to that page, and take a screenshot.
  await page.goto(route);
  await page.screenshot({
    path: `${ORIGINAL_DIR}/${fileName}.png`,
    fullPage: true,
  });

  return new Promise(res => res());
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
    }
    resolve();
  });
}

describe("take original screenshots", function() {
  let browser, page, URLS;

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

    URLS = await readFileLineByLine(TXT_FILE);
  });

  beforeEach(async function() {
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterEach(() => browser.close());

  // Wide screen tests!
  describe("wide screen", async function() {
    beforeEach(async function() {
      await page.setViewport({ width: 800, height: 600 });
    });
    await Promise.all(
      URLS.map((pageObj, i) =>
        it(url, async function() {
          await takeOriginalScreenshot(page, `${url}`, i, "wide");
        }).timeout(0),
      ),
    );
    // And your other routes, 404, etc.
  });

  // Narrow screen tests are the same, but with a different viewport.
  describe("narrow screen", async function() {
    beforeEach(async function() {
      await page.setViewport({ width: 375, height: 667 });
    });
    await Promise.all(
      URLS.map((pageObj, i) =>
        it(url, async function() {
          await takeOriginalScreenshot(page, `${url}`, i, "narrow");
        }).timeout(0),
      ),
    );
    // And your other routes, 404, etc.
  });
});

describe("compare new screenshots", function() {
  let browser, page;

  // This is run when the suite starts up.
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

  afterEach(async () => {
    await browser.close();
  });

  // Wide screen tests!
  describe("wide screen", function() {
    beforeEach(async function() {
      await page.setViewport({ width: 800, height: 600 });
    });
    it("/view1", async function(done) {
      const fileName = await takeScreenshotToCompare(page, "view1", "wide");
      await compareScreenshots(fileName);
    });
    // And your other routes, 404, etc.
  });

  // Narrow screen tests are the same, but with a different viewport.
  describe("narrow screen", function() {
    beforeEach(async function() {
      await page.setViewport({ width: 375, height: 667 });
    });
    it("/view1", async function(done) {
      const fileName = await takeScreenshotToCompare(page, "view1", "narrow");
      await compareScreenshots(fileName);
    });
    // And your other routes, 404, etc.
  });
});
