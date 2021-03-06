const fs = require('fs')
const path = require('path')
const { NOTION_TOKEN, SOURCES } = require('./src/lib/notion/server-constants')

try {
  fs.unlinkSync(path.resolve('.blog_index_data'))
} catch (_) {
  /* non fatal */
}
try {
  fs.unlinkSync(path.resolve('.blog_index_data_previews'))
} catch (_) {
  /* non fatal */
}

const warnOrError =
  process.env.NODE_ENV !== 'production'
    ? console.warn
    : msg => {
        throw new Error(msg)
      }

if (!NOTION_TOKEN) {
  // We aren't able to build or serve images from Notion without the
  // NOTION_TOKEN being populated
  warnOrError(
    `\nNOTION_TOKEN is missing from env, this will result in an error\n` +
      `Make sure to provide one before starting Next.js`
  )
}

if (!SOURCES.blog.index) {
  warnOrError(
    `\nBLOG_INDEX_ID is missing from env, this will result in an error\n` +
      `Make sure to provide one before starting Next.js`
  )
}

if (!SOURCES.pages.index) {
  warnOrError(
    `\nPAGES_INDEX_ID is missing from env, this will result in an error\n` +
      `Make sure to provide one before starting Next.js`
  )
}

module.exports = {
  target: 'experimental-serverless-trace',
}
