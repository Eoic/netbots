const express = require('express')
const router = express.Router()
const path = require('path')

function getFile(filename) {
    return path.join(__dirname, '..', filename)
}

router.get('/robots.txt', (_req, res) => {
    res.sendFile(getFile('robots.txt'))
})

router.get('/sitemap.xml', (_req, res) => {
    res.sendFile(getFile('sitemap.xml'))
})

module.exports = router