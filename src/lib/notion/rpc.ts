import fetch, { Response } from 'node-fetch'
import { API_ENDPOINT, NOTION_TOKEN } from './server-constants'
import { PageChunk } from './types'

export default async function rpc(
  fnName: 'getRecordValues',
  body: {
    requests: {
      id: string
      table: string
    }[]
  }
): Promise<{
  results: {
    value: {
      id: string
      given_name: string
      family_name: string
    }
  }[]
}>
export default async function rpc(
  fnName: 'loadPageChunk',
  body: {
    pageId: string
    limit: number
    cursor: {
      stack: any[]
    }
    chunkNumber: number
    verticalColumns: boolean
  }
): Promise<PageChunk>
export default async function rpc(
  fnName: 'queryCollection',
  body: {
    collectionId: string
    collectionViewId: string
    loader: {
      limit: number
      loadContentCover: boolean
      type: string
      userLocale: string
      userTimeZone: string
    }
    query: {
      aggregate: {
        aggregation_type: string
        id: string
        property: string
        type: string
        view_type: string
      }
      filter: unknown[]
      filter_operator: string
      sort: unknown[]
    }
  }
): Promise<PageChunk>
export default async function rpc(fnName: string, body: any): Promise<any> {
  if (!NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN is not set in env')
  }
  const res = await fetch(`${API_ENDPOINT}/${fnName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `token_v2=${NOTION_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (res.ok) {
    return res.json()
  } else {
    throw new Error(await getError(res))
  }
}

export async function getError(res: Response) {
  return `Notion API error (${res.status}) \n${getJSONHeaders(
    res
  )}\n ${await getBodyOrNull(res)}`
}

export function getJSONHeaders(res: Response) {
  return JSON.stringify(res.headers.raw())
}

export function getBodyOrNull(res: Response) {
  try {
    return res.text()
  } catch (err) {
    return null
  }
}

export function values<T>(obj: { [key: string]: T }) {
  const values: T[] = []

  Object.keys(obj).forEach(key => {
    values.push(obj[key])
  })
  return values
}
