const fs = require('fs')
const zipdir = require('zip-a-folder').zip
const pkg = require('./package.json')
const today = new Date()
today.setHours(0, 0, 0, 0)
const isoToday = today.toISOString().split('T')[0]

const banner = `/*!
 *
 *  ${pkg.name} v${pkg.version} (${isoToday})
 * ${pkg.homepage}
 * @license ${pkg.license}
 *
 */
`
const htmlBanner = `<title>accessible-event-calendar</title>
  <!--

    ${pkg.name} v${pkg.version} (${isoToday})
    ${pkg.homepage}
    @license ${pkg.license}

  -->`

const data = fs.readdirSync('./dist/').forEach(fileName => {
  if (/.min.js$/.test(fileName)) {
    const js = fs.readFileSync(`./dist/${fileName}`, {encoding:'utf8'})
    fs.writeFileSync(`./dist/${fileName}`, `${js}\n${banner}`)
  } else if (/.js$/.test(fileName)) {
      const js = fs.readFileSync(`./dist/${fileName}`, {encoding:'utf8'})
    fs.writeFileSync(`./dist/${fileName}`, `${banner}${js}`)
  } else if (/.css$/.test(fileName)) {
    const css = fs.readFileSync(`./dist/${fileName}`, {encoding:'utf8'})
    fs.writeFileSync(`./dist/${fileName}`, `${banner}${css}`)
  } else if (/.html$/.test(fileName)) {
    const html = fs.readFileSync(`./dist/${fileName}`, {encoding:'utf8'})
    fs.writeFileSync(`./dist/${fileName}`, html.replace(/\<title\>accessible-event-calendar\<\/title\>/, htmlBanner))
  }
})

zipdir('./dist', `./accessible-event-calendar-v${pkg.version}.zip`, (err, buffer) => {
  throw err
})
