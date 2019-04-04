const puppeteer = require('puppeteer');
const fs = require('fs-extra');

(async function main() {
    try {
        const browser = await puppeteer.launch({
            // headless: true
            headless: false
        });
        const page = await browser.newPage();
        page.setUserAgent('');

        await page.goto('https://experts.shopify.com/');
        await page.waitForSelector('.section');
        const sections = await page.$$('.section'); // $ means single & $$means many
        // console.log(sections.length);

        await fs.writeFile('out/out.csv', 'Section,Title,Location,Testimonials,Price \n');

        for (let i = 0; i < sections.length; i++) {

            await page.goto('https://experts.shopify.com/');
            await page.waitForSelector('.section');
            const sections = await page.$$('.section');

            const section = sections[i];
            const button = await section.$('a.marketing-button');
            const buttonName = await page.evaluate(button => button.innerText, button);

            console.log('\n\n');
            console.log('button name :', buttonName);
            button.click();

            await page.waitForSelector('#ExpertsResults');
            const lis = await page.$$('#ExpertsResults > li');

            // loop over each LI on the inner page
            for (const li of lis) {
                const title = await li.$eval('h2', h2 => h2.innerText);

                const location = await li.$eval('ul.expert-list-details > li', li => li.innerText);
                const para = await li.$eval('div.expert-list-summary > p >strong', p => p.innerText);
                const price = para.split('$')[1];
                console.log('title :', title, ' location :', location, ' price: ', price);

                await fs.appendFile('out/out.csv', ` "${buttonName}","${title}","${location}","${price}" \n`)
            }
        }

        console.log('done');
        await browser.close();

    } catch (e) {
        console.log('our error', e);
    }
})();