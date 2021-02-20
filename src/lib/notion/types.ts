import { Block } from './blocks'

interface Collection {
  value: {
    schema: {
      [key: string]: {
        name: string
        type: string
      }
    }
  }
}

export interface PageChunk {
  recordMap: {
    collection: {
      [key: string]: Collection
    }
    block: {
      [key: string]: Block
    }
  }
}

type Checkbox = 'Yes' | 'No'

export interface Post {
  id: string
  Slug: string
  Page: string
  Published: Checkbox

  preview?
  content?: Block[]
  hasTweet?: boolean
}

export interface Blog extends Post {
  Author: string
  Date: number

  authorName?: string
}
export function implementsBlog(post: Post): post is Blog {
  return typeof (post as Blog).Date === 'number'
}

export interface Page extends Post {
  Header: Checkbox
}

export interface User {
  id: string
  fullName: string
}
