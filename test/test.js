
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
  const _URLS = fs
    .readFileSync(txtFile, "utf-8")
    .split("\n")
    .filter(Boolean);

  return _URLS;
};

async function takeOriginalScreenshot(page, route, filePrefix) {
  // If you didn't specify a file, use the name of the route.
  console.log("ROUTE: ", route, "FILE PREFIX: ", filePrefix);
  let fileName = route.replace(/\//g, "-").substr(0);

  // go to a page, and take a screenshot.
  await page.goto(route, { timeout: 0, waitUntil: "domcontentloaded" });
  await page.screenshot({
    path: `${ORIGINAL_DIR}/${filePrefix}/${fileName}.png`,
    fullPage: true,

  });
  return;
}

const makeDirectories = async directoryName => {
  if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName);
  // And its wide screen/small screen subdirectories.
  if (!fs.existsSync(`${directoryName}/wide`))
    fs.mkdirSync(`${directoryName}/wide`);
  if (!fs.existsSync(`${directoryName}/narrow`))
    fs.mkdirSync(`${directoryName}/narrow`);
};

describe("take original screenshots", function() {
  let browser, page, URLS;

  const getUrls = async () => {
    URLS = await readFileLineByLine(TXT_FILE);
  };

  // Create the test directory if needed. This and the ORIGINAL_DIR
  before(async () => {
    makeDirectories(ORIGINAL_DIR);
  });

  it("screenshots done", async function(done) {
    await getUrls();
    console.log(URLS);
    Promise.all(
      URLS.map(async (url, i) => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1024 });
        await takeOriginalScreenshot(page, url, "wide");
        await browser.close();
      }),
    ).then(done);
  }).timeout(0);
});
