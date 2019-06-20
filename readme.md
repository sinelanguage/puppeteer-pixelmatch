# Puppeteer PixelMatch

### Use case

This utility uses Google's Puppeteer which is a headless browser running v8 engine in node.
We use its engine to render web pages from either a list of URLs in a text file or a sitemap xml file.

We use node and the Mocha testing framework to run test scripts that will take the URLs from the source file (txt or xml), render each one in Puppeteer in Node per each screen size / viewport size, and take a a screenshot per viewport setting and save it into a folder per viewport setting.  This is referred to as taking an ORIGINAL screenshot

We then run a script that takes an additional screenshot at a later time (per viewport size) and save it into a folder (per viewport size).  This is referred to as the CURRENT screenshot for this purpose.   Then we use node / pixelmatch to load the ORIGINAL and the CURRENT screenshot into a bytecode buffer.  This is where the PixelMatch lib takes over it will load those two buffers into memory and create a third PNG out of the two screenshots that highlights only the differences between the two screenshots pixel by pixel.

### How to use

1. If you don't need either your original or current screenshots run either `npm run delete_originals` or `npm run delete_current` or to clear them all you can run `npm run clear_screenshots`
2. Most likely you will be clearing hte CURRENT screenshots more often to compare against the originals with a new set of screenshots
3. To take a set of original screenshots to compare against at a later date and time, run `npm run original`
4. To take a comparison set of screenshots run `npm run compare`
5. We try to log out to the console when each set of screenshots is complete, but this is buggy at the moment

### TODOS
1. make clearer scripts and logic to use either a txt or xml file
2. work out the bugs with logging out when the tests are complete
