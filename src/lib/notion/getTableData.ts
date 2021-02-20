import { values } from './rpc'
import Slugger from 'github-slugger'
import queryCollection from './queryCollection'
import { implementsBlog, Post } from './types'
import { PropType } from './props'
import { CollectionBlock, implementsPageBlock, PageBlock } from './blocks'

export default async function getTableData(
  collectionBlock: CollectionBlock,
  keepEmptySlug: boolean
) {
  const slugger = new Slugger()

  const { value } = collectionBlock
  let table: Post[] = []
  const col = await queryCollection({
    collectionId: value.collection_id,
    collectionViewId: value.view_ids[0],
  })
  const entries = values(col.recordMap.block)
    .filter(block => {
      return (
        block.value.parent_id === value.collection_id &&
        implementsPageBlock(block)
      )
    })
    .map(block => block as PageBlock)

  const colId = Object.keys(col.recordMap.collection)[0]
  const schema = col.recordMap.collection[colId].value.schema
  const schemaKeys = Object.keys(schema)

  for (const entry of entries) {
    const props = entry.value && entry.value.properties
    const row: any = {}

    if (!props) continue
    if (entry.value.content) {
      row.id = entry.value.id
    }

    schemaKeys
      .map(key => {
        if (!props[key]) {
          return {
            key,
            val: null,
          }
        }

        let val: number | string

        if (props[key][0][1]) {
          const propType = (props[key][0][0] === '‣'
            ? props[key][0][1][0]
            : props[key][0][1]) as PropType

          // authors and blocks are centralized
          switch (propType[0]) {
            case 'a': // link
              val = propType[1]
              break
            case 'u': // user
              val = propType[1]
              break
            case 'p': // page (block)
              const page = col.recordMap.block[propType[1]] as PageBlock
              row.id = page.value.id
              val = page.value.properties.title[0][0]
              break
            case 'd': // date
              // start_date: 2019-06-18
              // start_time: 07:00
              // time_zone: Europe/Berlin, America/Los_Angeles

              if (!propType[1].start_date) {
                break
              }
              // initial with provided date
              const providedDate = new Date(
                propType[1].start_date + ' ' + (propType[1].start_time || '')
              ).getTime()

              // calculate offset from provided time zone
              const timezoneOffset =
                new Date(
                  new Date().toLocaleString('en-US', {
                    timeZone: propType[1].time_zone,
                  })
                ).getTime() - new Date().getTime()

              // initialize subtracting time zone offset
              val = new Date(providedDate - timezoneOffset).getTime()
              break
            default:
              console.error('unknown type', propType[0], propType)
              break
          }
        } else {
          val = props[key][0][0] as string
        }

        if (typeof val === 'string') {
          val = val.trim()
        }

        return {
          key,
          val,
        }
      })
      .forEach(({ key, val }) => {
        row[schema[key].name] = val
      })

    const post = row as Post

    // auto-generate slug from title
    if (!keepEmptySlug && !post.Slug && implementsBlog(post)) {
      const date = new Date(post.Date)
      post.Slug = slugger.slug(
        `${date
          .getFullYear()
          .toString()
          .padStart(4, '0')}${(date.getMonth() + 1)
          .toString()
          .padStart(2, '0')}${date
          .getDate()
          .toString()
          .padStart(2, '0')}${date
          .getHours()
          .toString()
          .padStart(2, '0')}${date
          .getMinutes()
          .toString()
          .padStart(2, '0')}${date
          .getSeconds()
          .toString()
          .padStart(2, '0')}`
      )
    }
    post.Slug = normalizeSlug(post.Slug)

    if (!keepEmptySlug && !post.Slug) continue

    table.push(post)
  }
  return table
}

function normalizeSlug(slug) {
  if (typeof slug !== 'string') return slug

  let startingSlash = slug.startsWith('/')
  let endingSlash = slug.endsWith('/')

  if (startingSlash) {
    slug = slug.substr(1)
  }
  if (endingSlash) {
    slug = slug.substr(0, slug.length - 1)
  }
  return startingSlash || endingSlash ? normalizeSlug(slug) : slug
}
