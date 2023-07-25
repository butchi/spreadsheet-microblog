const axios = require("axios")

const puppeteer = require('puppeteer')

exports.handler = async (event, context) => {
    const query = await event.queryStringParameters.q || 'No query'

    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto(query)
    await page.waitForSelector('input[name^="entry."]')
    await page.waitForTimeout(999)

    const formAttr = await page.evaluate(_ => {
        const elm = document.querySelector('form[action]')

        return ({
            id: elm.getAttribute("id"),
            action: elm.getAttribute("action"),
            method: elm.getAttribute("method"),
        })
    })

    const nameArr = await page.evaluate(_ => {
        return [...document.querySelectorAll('input[name^="entry."]')].map(elm => elm.getAttribute("name"))
    })

    return {
        statusCode: 200,
        body: JSON.stringify({
            formAttr,
            nameArr,
        })
    }
}