const puppeteer = require('puppeteer');
const express = require('express')
const app = express()
const port = 3000

let browser = null;

app.get('/api/driver', async (req, res) => {
    licenseInfo = null;

    try {
        const page = await browser.newPage();
        await page.goto('https://moj.gov.pl/uslugi/engine/ng/index?xFormsAppName=UprawnieniaKierowcow');

        await page.setViewport({ width: 1080, height: 1024 });

        await page.locator('#imiePierwsze').fill(req.query.name);
        await page.locator('#nazwisko').fill(req.query.surname);
        await page.locator('#seriaNumerBlankietuDruku').fill(req.query.licenseId);
        await page.locator('.service-card button').click();

        const response = await page.waitForResponse(
            response =>
                response.url().startsWith("https://moj.gov.pl/nforms/api/UprawnieniaKierowcow") && response.url().includes("data/driver-permissions"),
        );

        if (response.ok()) {
            licenseInfo = await response.json();
        }

    } catch (error) {
        console.log(error)
    }

    res.json(licenseInfo)
})

app.listen(port, async () => {
    browser = await puppeteer.launch();
    console.log(`Polish driving license validator app listening on port ${port}`)
})

process.on('exit', async () => {
    await browser.close();
});