import rpc, { values } from './rpc'
import { implementsPageBlock } from './blocks'

export default async function getPageData(pageId: string) {
  try {
    const data = await loadPageChunk({ pageId })
    const blocks = values(data.recordMap.block)

    const firstBlock = blocks[0]
    if (
      firstBlock &&
      implementsPageBlock(firstBlock) &&
      firstBlock.value.content
    ) {
      // remove table blocks
      blocks.splice(0, 3)
    }

    return { blocks }
  } catch (err) {
    console.error(`Failed to load pageData for ${pageId}`, err)
    return { blocks: [] }
  }
}

export function loadPageChunk({
  pageId,
  limit = 100,
  cursor = { stack: [] },
  chunkNumber = 0,
  verticalColumns = false,
}: any) {
  return rpc('loadPageChunk', {
    pageId,
    limit,
    cursor,
    chunkNumber,
    verticalColumns,
  })
}
