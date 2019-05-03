const puppeteer = require("puppeteer");
const devices = require("puppeteer/DeviceDescriptors");
const TEST_DIR = "screenshots-current";
const ORIGINAL_DIR = "screenshots-originals";
const TXT_FILE = "./constants/nl-urls.mini.txt";
const XML_FILE = "./constants/sitemap.xml";
const MMC_NL = "https://www.mitsubishi-motors.nl";

const VIEWPORTS = {
  large_desktop_screen: { width: 1920, height: 1080, isMobile: false },
  laptop_screen: { width: 1440, height: 900, isMobile: false },
};

const VIEWPORT_STRINGS = Object.keys(VIEWPORTS).map(key => {
  const str = key.toString();
  return str;
});

const DEVICES = {
  IPHONE_8: devices["iPhone 8"],
  IPHONE_8_PLUS: devices["iPhone 8 Plus"],
  IPHONE_X: devices["iPhone X"],
  PIXEL_2: devices["Pixel 2"],
  PIXEL_2_XL: devices["Pixel 2 XL"],
  IPAD_PRO: devices["iPad Pro"],
  IPAD: devices["iPad"],
  IPAD_MINI: devices["iPad Mini"],
};

module.exports = {
  TEST_DIR,
  ORIGINAL_DIR,
  TXT_FILE,
  XML_FILE,
  MMC_NL,
  VIEWPORTS,
  VIEWPORT_STRINGS,
  DEVICES,
};
