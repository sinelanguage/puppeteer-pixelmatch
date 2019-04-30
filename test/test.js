const puppeteer = require("puppeteer");
const expect = require("chai").expect;
const fs = require("fs");
const CONSTANTS = require("../src/constants");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");

const { TEST_DIR, ORIGINAL_DIR, TXT_FILE } = CONSTANTS;

const logBrowserIsClosed = () => {
  console.log("Headless Chrome browser is closed");
};

const doneComparingScreenshots = () => {
  console.log("Finished comparing screenshots");
};

// Read a txt file line by line;
const readFileLineByLine = async txtFile => {
  const _URLS = fs
    .readFileSync(txtFile, "utf-8")
    .split("\n")
    .filter(Boolean);

  return _URLS;
};

async function takeScreenshot(page, route, filePrefix, dir, original) {
  // console.log("ROUTE: ", route, "FILE PREFIX: ", filePrefix);
  let fileName = route.replace(/\//g, "-").substr(0);

  // Go to a page, and take a screenshot.
  await page.goto(route, { timeout: 0, waitUntil: "domcontentloaded" });
  await page.screenshot({
    path: `${dir}/${filePrefix}/${fileName}.png`,
    fullPage: true,
  });

  // Resolve promise with the fileName if its not taking an original (first or initial) screenshot
  if (!original) {
    console.log(
      `Comparison screenshot saved to: ${dir}/${filePrefix}/${fileName}.png`,
    );
    return fileName;
  }
  // If this is the origina (first or initial) screenshot, just return
  console.log(
    `Initial screenshot to compare saved to: ${dir}/${filePrefix}/${fileName}.png`,
  );
  return;
}

// Make our directories to save the screenshots into
const makeDirectories = async (directoryName, viewPortDir, original) => {
  if (!fs.existsSync(directoryName)) fs.mkdirSync(directoryName);
  // And its wide screen/small screen subdirectories.
  if (!fs.existsSync(`${directoryName}/${viewPortDir}`))
    fs.mkdirSync(`${directoryName}/${viewPortDir}`);
  if (!original && !fs.existsSync(`${directoryName}/${viewPortDir}/diff`))
    fs.mkdirSync(`${directoryName}/${viewPortDir}/diff`);
};

// Compare screenshots using node and pixelmatch
const compareScreenshots = async (fileName, viewPortDir) => {
  return new Promise(async (resolve, reject) => {
    try {
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

        // Use Pixelmatch to figure out what pixels have changed
        const numberOfDifferentPixels = pixelmatch(
          img1.data,
          img2.data,
          diff.data,
          img1.width,
          img1.height,
          { threshold: 0.1 },
        );

        // If any pixels changed, save a PNG highlighting only the changed pixels
        if (numberOfDifferentPixels > 0) {
          diff
            .pack()
            .pipe(
              fs.createWriteStream(
                `${TEST_DIR}/${viewPortDir}/diff/${fileName}-diff.png`,
              ),
            );
        }

        // The files should look the same.
        expect(numberOfDifferentPixels, "number of different pixels").equal(0);
        console.log("Number of different pixels: ", numberOfDifferentPixels);
      }
      resolve();
    } catch (error) {
      resolve(`Error: ${error}`);
    }
  });
};

const getUrls = async () => await readFileLineByLine(TXT_FILE);

describe("take original screenshots", function() {
  it("Headless chrome is launching and taking origin screenshots", async function() {
    // Make directories if they don't exist
    await makeDirectories(ORIGINAL_DIR, "wide", true);
    const URLS = await getUrls();
    const browser = await puppeteer.launch();

    // Return an array of promises that are waiting for all screenshots to be taken and saved
    return Promise.all(
      URLS.map(async (url, i) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1024 });
        await takeScreenshot(page, url, "wide", ORIGINAL_DIR, true);
      }),
    )
      .then(async () => {
        await browser.close();
      })
      .then(logBrowserIsClosed)
      .catch(async err => {
        await browser.close();
        logBrowserIsClosed();
        console.log(`Error: ${err}`);
      });
  }).timeout(0);
});

describe("take and compare screenshots", function() {
  it("should launch headless Chrome, take and compare screenshots, and report no pixel differences", async function() {
    // Make directories if they don't exist
    await makeDirectories(TEST_DIR, "wide");
    const URLS = await getUrls();

    // Launch headless chrome
    const browser = await puppeteer.launch();

    // Return an array of promises that are waiting for all screenshots to be taken and saved

    return Promise.all(
      URLS.map(async (url, i) => {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1024 });
        const fileName = await takeScreenshot(page, url, "wide", TEST_DIR);
        await compareScreenshots(fileName, "wide");
      }),
    )
      .then(doneComparingScreenshots)
      .then(async () => {
        await browser.close();
      })
      .then(logBrowserIsClosed)
      .catch(async err => {
        await browser.close();
        logBrowserIsClosed();
        console.log(`Error: ${err}`);
      });
  }).timeout(0);
});
