import { Sema } from 'async-sema'
import rpc, { values } from './rpc'
import getTableData from './getTableData'
import { getPostPreview } from './getPostPreview'
import { readFile, writeFile } from '../fs-helpers'
import { SOURCES } from './server-constants'
import { Blog, implementsBlog, Page, Post } from './types'
import { CollectionBlock, implementsCollectionBlock } from './blocks'

export default async function getIndex(kind: 'blog'): Promise<Blog[]>
export default async function getIndex(kind: 'pages'): Promise<Page[]>
export default async function getIndex(
  kind: keyof typeof SOURCES
): Promise<Post[]> {
  let postsTable: Post[]
  const useCache = process.env.USE_CACHE === 'true'
  const cacheFile = `${SOURCES[kind].cache}_previews`

  if (useCache) {
    try {
      postsTable = JSON.parse(await readFile(cacheFile, 'utf8'))
    } catch (_) {
      /* not fatal */
    }
  }

  if (!postsTable) {
    try {
      const data = await rpc('loadPageChunk', {
        pageId: SOURCES[kind].index,
        limit: 999, // TODO: figure out Notion's way of handling pagination
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      })

      // Parse table with posts
      const tableBlock = values(data.recordMap.block).find(block =>
        implementsCollectionBlock(block)
      )

      postsTable = await getTableData(
        tableBlock as CollectionBlock,
        kind === 'pages'
      )
    } catch (err) {
      console.error(`Failed to load Notion posts`, err)
      return []
    }

    // only get 10 most recent post's previews
    postsTable = postsTable.splice(0, 10)

    const sema = new Sema(3, { capacity: postsTable.length })

    await Promise.all(
      postsTable
        .sort((a, b) => {
          if (!implementsBlog(a) || !implementsBlog(b)) {
            return 0
          }
          return Math.sign(b.Date - a.Date)
        })
        .map(async post => {
          await sema.acquire()
          post.preview = post.id ? await getPostPreview(post.id) : []
          sema.release()
        })
    )

    if (useCache) {
      writeFile(cacheFile, JSON.stringify(postsTable), 'utf8').catch(() => {})
    }
  }

  return postsTable
}
