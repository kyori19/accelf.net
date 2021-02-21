import { PropType, PropVal } from './props'

type BaseBlockValue = {
  id: string

  parent_id?: string
}

type BookmarkBlockValue = BaseBlockValue & {
  type: 'bookmark'

  format: {
    bookmark_icon: string
    bookmark_cover: string
  }
  properties: {
    link: {
      0: {
        0: string
      }
    }
    title: {
      0: {
        0: string
      }
    }
    description: {
      0: {
        0: string
      }
    }
  }
}

type CalloutBlockValue = BaseBlockValue & {
  type: 'callout'

  format: {
    page_icon: string
  }

  properties: {
    title: Text[]
  }
}

type CodeBlockValue = BaseBlockValue & {
  type: 'code'

  properties: {
    title: {
      0: {
        0: string
      }
    }
    language: {
      0: {
        0: string
      }
    }
  }
}

type CollectionBlockValue = BaseBlockValue & {
  type: 'collection_view'

  collection_id: string
  view_ids: string[]
}
export type CollectionBlock = Block<CollectionBlockValue>

export function implementsCollectionBlock(
  block: Block
): block is CollectionBlock {
  return block.value.type === 'collection_view'
}

type DividerBlockValue = BaseBlockValue & {
  type: 'divider'
}

type EquationBlockValue = BaseBlockValue & {
  type: 'equation'

  properties: {
    title: {
      0: {
        0: string
      }
    }
  }
}

export type HeaderBlockValue = BaseBlockValue & {
  type: 'header' | 'sub_header' | 'sub_sub_header'

  properties: {
    title: Text[]
  }
}

export type ListBlockValue = BaseBlockValue & {
  type: 'bulleted_list' | 'numbered_list'

  properties: {
    title: Text[]
  }
}
type ListBlock = Block<ListBlockValue>
const listTypes = new Set(['bulleted_list', 'numbered_list'])

export function implementsListBlock(block: Block): block is ListBlock {
  return listTypes.has(block.value.type)
}

type MediaBlockValue = BaseBlockValue & {
  type: 'embed' | 'image' | 'video'

  format: {
    block_width?: number
    block_height?: number
    display_source: string
    block_aspect_ratio?: number
  }
  file_ids?: string[]
  properties: {
    caption?: Text[]
  }
}

type PageBlockValue = BaseBlockValue & {
  type: 'page'

  properties: {
    [key: string]: {
      0:
        | PropVal
        | {
            0: '‣'
            1: {
              0: PropType
            }
          }
    }
    title: {
      0: {
        0: string
      }
    }
  }
  content: string[]
}
export type PageBlock = Block<PageBlockValue>

export function implementsPageBlock(block: Block): block is PageBlock {
  return block.value.type === 'page'
}

export type Text = {
  0: string
  1?: string[]
}

type TextBlockValue = BaseBlockValue & {
  type: 'header' | 'sub_header' | 'sub_sub_header' | 'quote' | 'text'

  properties: {
    title: Text[]
  }
}

type TweetBlockValue = BaseBlockValue & {
  type: 'tweet'
  properties: {
    source: {
      0: {
        0: string
      }
    }

    html?: string
  }
}
type TweetBlock = Block<TweetBlockValue>

export function implementsTweetBlock(block: Block): block is TweetBlock {
  return block.value.type === 'tweet'
}

type BlockValue =
  | BookmarkBlockValue
  | CalloutBlockValue
  | CodeBlockValue
  | CollectionBlockValue
  | DividerBlockValue
  | EquationBlockValue
  | HeaderBlockValue
  | ListBlockValue
  | MediaBlockValue
  | PageBlockValue
  | TextBlockValue
  | TweetBlockValue

export interface Block<T extends BlockValue = BlockValue> {
  value: T
}
