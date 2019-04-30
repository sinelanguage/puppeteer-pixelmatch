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

const logBrowserIsClosed = () => {
  console.log("Headless Chrome browser is closed");
};

// mocha -g 'take'
// mocha -g 'compare'
// read a txt file line by line;
const readFileLineByLine = async txtFile => {
  const _URLS = fs
    .readFileSync(txtFile, "utf-8")
    .split("\n")
    .filter(Boolean);

  return _URLS;
};

async function takeScreenshot(page, route, filePrefix, dir, original) {
  // If you didn't specify a file, use the name of the route.
  // console.log("ROUTE: ", route, "FILE PREFIX: ", filePrefix);
  let fileName = route.replace(/\//g, "-").substr(0);

  // go to a page, and take a screenshot.
  await page.goto(route, { timeout: 0, waitUntil: "domcontentloaded" });
  await page.screenshot({
    path: `${dir}/${filePrefix}/${fileName}.png`,
    fullPage: true,
  });
  if (!original) {
    console.log(
      `Comparison screenshot saved to: ${dir}/${filePrefix}/${fileName}.png`,
    );
    return fileName;
  }
  console.log(
    `Initial screenshot to compare saved to: ${dir}/${filePrefix}/${fileName}.png`,
  );
  return;
}

const makeDirectories = async (directoryName, viewPortDir, original) => {
  if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName);
  // And its wide screen/small screen subdirectories.
  if (!fs.existsSync(`${directoryName}/${viewPortDir}`))
    fs.mkdirSync(`${directoryName}/${viewPortDir}`);
  if (!original && !fs.existsSync(`${directoryName}/${viewPortDir}/diff`))
    fs.mkdirSync(`${directoryName}/${viewPortDir}/diff`);
};

const compareScreenshots = async (fileName, viewPortDir) => {
  return new Promise((resolve, reject) => {
    const img1 = fs
      .createReadStream(`${TEST_DIR}/${viewPortDir}/${fileName}.png`)
      .pipe(new PNG())
      .on("parsed", doneReading);
    const img2 = fs
      .createReadStream(`${ORIGINAL_DIR}/${viewPortDir}/${fileName}.png`)
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
      diff
        .pack()
        .pipe(
          fs.createWriteStream(
            `${TEST_DIR}/${viewPortDir}/diff/${fileName}-diff.png`,
          ),
        );

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
      console.log("Number of different pixels: ", numDiffPixels);
    }
    resolve(() => {
      console.log("Done comparing screenshots");
    });
  });
};

const getUrls = async () => await readFileLineByLine(TXT_FILE);

describe("take original screenshots", function() {
  it("Headless chrome is launching and taking origin screenshots", async function() {
    await makeDirectories(ORIGINAL_DIR, "wide", true);
    const URLS = await getUrls();
    // launch headless chrome
    const browser = await puppeteer.launch();

    Promise.all(
      URLS.map(async (url, i) => {
        const page = await browser.newPage();

        // set viewPort size and take screenshot
        await page.setViewport({ width: 1920, height: 1024 });
        await takeScreenshot(page, url, "wide", ORIGINAL_DIR, true);
      }),
    ).then(async () => {
      await browser.close().then(logBrowserIsClosed);
      expect(true).to.be.true;
    });
  });
});

describe("take and compare screenshots", function() {
  it("screenshots done", async function() {
    await makeDirectories(TEST_DIR, "wide");
    const URLS = await getUrls();

    // launch headless chrome
    const browser = await puppeteer.launch();

    return Promise.all(
      URLS.map(async (url, i) => {
        const page = await browser.newPage();

        // set viewPort size and take screenshot
        await page.setViewport({ width: 1920, height: 1024 });
        const fileName = await takeScreenshot(page, url, "wide", TEST_DIR);
        await compareScreenshots(fileName, "wide");
      }),
    ).then(async () => {
      await browser.close().then(logBrowserIsClosed);
    });
  }).timeout(0);
});
