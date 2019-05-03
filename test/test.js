const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const expect = require("chai").expect;
const fs = require("fs");
const CONSTANTS = require("../constants/");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const xmlReader = require("read-xml");
const xml2js = require("xml2js");
const parser = new xml2js.Parser({ attrkey: "urlset" });
const fetch = require("node-fetch");

const {
  TEST_DIR,
  ORIGINAL_DIR,
  TXT_FILE,
  XML_FILE,
  MMC_NL,
  VIEWPORTS,
  VIEWPORT_STRINGS,
  DEVICES,
} = CONSTANTS;

const { large_desktop_screen, laptop_screen } = VIEWPORTS;
const {
  IPHONE_8,
  IPHONE_8_PLUS,
  IPHONE_X,
  IPAD,
  IPAD_MINI,
  IPAD_PRO,
  PIXEL_2,
  PIXEL_2_XL,
} = DEVICES;

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

const getUrlsFromTxtFile = async () => await readFileLineByLine(TXT_FILE);

const getSitemapXml = async urlPrefix => {
  const url = `${urlPrefix}/sitemap.xml`;
  let xmlData;
  try {
    const response = await fetch(url);
    xmlData = await response.text();
  } catch (error) {
    console.log(`Error fetching sitemap.xml: ${error}`);
  }
  return xmlData;
};

const readXmlFile = async xmlString => {
  let xmlData;
  await parser.parseString(xmlString, (error, result) => {
    if (error === null) {
      xmlData = result;
    } else {
      console.log(`XML parsing error from file: ${xmlFile}, Error: ${error}`);
    }
  });
  return xmlData;
};

const getUrlsFromParsedSitemapXml = async JsFromXml =>
  JsFromXml.urlset.url.map(({ loc }) => loc[0]);

const takeScreenshot = async (page, route, filePrefix, dir, original) => {
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
};

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

describe("take original screenshots", function() {
  it("Headless chrome is launching and taking origin screenshots", async function() {
    // Make directories if they don't exist
    await makeDirectories(ORIGINAL_DIR, VIEWPORT_STRINGS[0], true);

    // Fetch the sitemap.xml
    const FETCHED_XML_FILE = await getSitemapXml(MMC_NL);

    // Read and parse the xml string as a JS object (Not JSON)
    const JS_FROM_XML = await readXmlFile(FETCHED_XML_FILE);

    // Get an array of URLS from the JS object from the parsed XML
    const URLS_FROM_PARSED_XML = await getUrlsFromParsedSitemapXml(JS_FROM_XML);

    // How many URLS should I expect screenshots for? Check the console.
    console.log(
      `Parsed ${URLS_FROM_PARSED_XML.length} urls from ${MMC_NL}/sitemap.xml`,
    );

    // Start headless Chrome session
    const browser = await puppeteer.launch();

    // Return an array of promises that are waiting for all screenshots to be taken and saved
    return Promise.all(
      URLS_FROM_PARSED_XML.map(async (url, i) => {
        try {
          const page = await browser.newPage();
          await page.setViewport(large_desktop_screen);
          await takeScreenshot(
            page,
            url,
            VIEWPORT_STRINGS[0],
            ORIGINAL_DIR,
            true,
          );
        } catch (error) {
          console.log(`Error taking original screenshots: ${error}`);
        }
      }),
    )
      .then(async () => {
        await browser.close();
      })
      .then(logBrowserIsClosed)
      .catch(async err => {
        await browser.close();
        logBrowserIsClosed();
        console.log(`Error taking original screenshots: ${err}`);
      });
  }).timeout(0);
});

describe("take and compare screenshots", function() {
  it("should launch headless Chrome, take and compare screenshots, and report no pixel differences", async function() {
    await makeDirectories(TEST_DIR, VIEWPORT_STRINGS[0]);
    const FETCHED_XML_FILE = await getSitemapXml(MMC_NL);
    const JS_FROM_XML = await readXmlFile(FETCHED_XML_FILE);
    const URLS_FROM_PARSED_XML = await getUrlsFromParsedSitemapXml(JS_FROM_XML);
    console.log(
      `Parsed ${URLS_FROM_PARSED_XML.length} urls from ${MMC_NL}/sitemap.xml`,
    );

    const browser = await puppeteer.launch();

    // Return an array of promises that are waiting for all screenshots to be taken and saved

    return Promise.all(
      URLS_FROM_PARSED_XML.map(async (url, i) => {
        let fileName;
        try {
          const page = await browser.newPage();
          await page.setViewport(large_desktop_screen);
          fileName = await takeScreenshot(
            page,
            url,
            VIEWPORT_STRINGS[0],
            TEST_DIR,
          );
        } catch (error) {
          console.log(`Error taking comparison screenshots: ${error}`);
        }

        try {
          await compareScreenshots(fileName, VIEWPORT_STRINGS[0]);
        } catch (error) {
          console.log(`Error creating a diff PNG: ${error}`);
        }
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
