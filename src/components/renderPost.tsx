import components from './components'
import { textBlock } from '../lib/notion/renderers'
import React, { ComponentType, CSSProperties, ReactFragment } from 'react'
import Heading from './heading'
import {
  Block,
  HeaderBlockValue,
  implementsListBlock,
  ListBlockValue,
  Text,
} from '../lib/notion/blocks'
import blogStyles from '../styles/blog.module.css'
import JsxParser from 'react-jsx-parser'
import ExtLink from './ext-link'

const headingTags: {
  [key in HeaderBlockValue['type']]: string | ComponentType
} = {
  header: 'h1',
  sub_header: 'h2',
  sub_sub_header: 'h3',
}

type ListItem = {
  id: string
  text: Text[]
  child?: List
}

type List = {
  tag: 'ul' | 'ol' | null
  contents: ListItem[]
}

const createList = (list: List) => {
  const Root = list.tag
  return {
    elem: (
      <Root key={`list-root-${list.contents[0].id}`}>
        {list.contents.map(item => (
          <li key={item.id}>
            {textBlock(item.text, true, item.id)}
            {item.child && createList(item.child).elem}
          </li>
        ))}
      </Root>
    ),
    newList: {
      tag: null,
      id: null,
      contents: [],
    },
  }
}

const listTagName = (value: ListBlockValue) =>
  value.type === 'bulleted_list' ? 'ul' : 'ol'

const listItem = (value: ListBlockValue) => ({
  id: value.id,
  text: value.properties.title,
})

const applyChild = (list: List, value: ListBlockValue) => {
  if (list.contents.length < 1) {
    return { list, done: false }
  }

  const last = list.contents.pop()
  if (last.id === value.parent_id) {
    if (last.child) {
      last.child.contents = [...last.child.contents, listItem(value)]
    } else {
      last.child = {
        tag: listTagName(value),
        contents: [listItem(value)],
      }
    }

    list.contents = [...list.contents, last]

    return { list, done: true }
  }

  if (!last.child) {
    list.contents = [...list.contents, last]
    return { list, done: false }
  }

  const res = applyChild(last.child, value)
  last.child = res.list
  list.contents = [...list.contents, last]
  return { list, done: res.done }
}

const RenderPost = ({
  content = [],
  noRootClass = false,
}: {
  content: Block[]
  noRootClass?: boolean
}) => (
  <div className={noRootClass ? undefined : blogStyles.post}>
    {
      content.reduce<{ elements: ReactFragment[]; list: List }>(
        ({ elements, list }, block, index, content) => {
          const { value } = block
          const { id } = value

          if (list.tag && !implementsListBlock(block)) {
            const res = createList(list)
            elements = [...elements, res.elem]
            list = res.newList
          }

          switch (value.type) {
            case 'page':
            case 'divider':
              return { elements, list }
            case 'text':
              if (!value.properties) {
                return { elements, list }
              }

              return {
                elements: [
                  ...elements,
                  textBlock(value.properties.title, false, id),
                ],
                list,
              }
            case 'bookmark':
              const { format, properties } = value
              const { bookmark_cover, bookmark_icon } = format
              const { link, title, description } = properties
              return {
                elements: [
                  ...elements,
                  <ExtLink
                    className={blogStyles.bookmark}
                    href={link[0][0]}
                    key={id}
                  >
                    <span className={blogStyles.title}>{title[0][0]}</span>
                    <p className={blogStyles.description}>
                      {description[0][0]}
                    </p>
                    <img
                      className={blogStyles.favicon}
                      src={bookmark_icon}
                      alt="Bookmark favicon"
                    />
                    <span className={blogStyles.url}>{link[0][0]}</span>
                    <img
                      className={blogStyles.cover}
                      src={bookmark_cover}
                      alt="Bookmark cover"
                    />
                  </ExtLink>,
                ],
                list,
              }
            case 'image':
            case 'video':
            case 'embed': {
              const { format, properties } = value
              const {
                block_width,
                block_height,
                display_source,
                block_aspect_ratio,
              } = format
              const caption = properties.caption
              const baseBlockWidth = 768
              const roundFactor = Math.pow(10, 2)
              // calculate percentages
              const rate = (block_width || 768) / baseBlockWidth
              const width = block_width
                ? `${Math.round(rate * 100 * roundFactor) / roundFactor}%`
                : block_height || '100%'

              const isImage = value.type === 'image'
              const Comp = isImage ? 'img' : 'video'
              const useWrapper = block_aspect_ratio && !block_height
              const childStyle: CSSProperties =
                useWrapper || caption
                  ? {
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      position: useWrapper ? 'absolute' : 'static',
                      top: useWrapper ? 0 : 'auto',
                    }
                  : {
                      width,
                      border: 'none',
                      height: block_height * rate || '100%',
                      display: 'block',
                      maxWidth: '100%',
                    }

              let child = null

              if (!isImage && !value.file_ids) {
                // external resource use iframe
                child = (
                  <iframe
                    style={childStyle}
                    src={display_source}
                    key={!useWrapper ? id : undefined}
                    className={!useWrapper ? 'asset-wrapper' : undefined}
                  />
                )
              } else {
                // notion resource
                child = (
                  <Comp
                    key={!useWrapper ? id : undefined}
                    src={`/api/asset?assetUrl=${encodeURIComponent(
                      display_source
                    )}&blockId=${id}`}
                    controls={!isImage}
                    alt={`${isImage ? 'An image' : 'A video'} from Notion`}
                    loop={!isImage}
                    muted={!isImage}
                    autoPlay={!isImage}
                    style={childStyle}
                  />
                )
              }

              const media = useWrapper ? (
                <div
                  style={{
                    paddingTop: `${Math.round(block_aspect_ratio * 100)}%`,
                    position: 'relative',
                  }}
                  className="asset-wrapper"
                  key={id}
                >
                  {child}
                </div>
              ) : (
                child
              )

              return {
                elements: [
                  ...elements,
                  caption ? (
                    <div
                      className="caption-block"
                      style={{
                        width,
                        position: 'static',
                      }}
                    >
                      {media}
                      {textBlock(caption, true, id)}
                    </div>
                  ) : (
                    media
                  ),
                ],
                list,
              }
            }
            case 'header':
            case 'sub_header':
            case 'sub_sub_header':
              const Tag = headingTags[value.type]
              return {
                elements: [
                  ...elements,
                  <Heading key={id}>
                    <Tag key={id}>
                      {textBlock(value.properties.title, true, id)}
                    </Tag>
                  </Heading>,
                ],
                list,
              }
            case 'code': {
              const content = value.properties.title[0][0]
              const language = value.properties.language[0][0]
              return {
                elements: [
                  ...elements,
                  language === 'LiveScript' ? (
                    <JsxParser
                      key={id}
                      jsx={content}
                      components={components}
                      componentsOnly={false}
                      allowUnknownElements={true}
                      blacklistedTags={['script', 'style']}
                    />
                  ) : (
                    <components.Code key={id} language={language || ''}>
                      {content}
                    </components.Code>
                  ),
                ],
                list,
              }
            }
            case 'quote': {
              return {
                elements: [
                  ...elements,
                  React.createElement(
                    'blockquote',
                    { key: id },
                    value.properties.title
                  ),
                ],
                list,
              }
            }
            case 'callout': {
              return {
                elements: [
                  ...elements,
                  <div className="callout" key={id}>
                    {value.format?.page_icon && (
                      <div>{value.format?.page_icon}</div>
                    )}
                    <div className="text">
                      {textBlock(value.properties.title, true, id)}
                    </div>
                  </div>,
                ],
                list,
              }
            }
            case 'tweet': {
              return {
                elements: [
                  ...elements,
                  <div
                    dangerouslySetInnerHTML={{ __html: value.properties.html }}
                    key={id}
                  />,
                ],
                list,
              }
            }
            case 'equation': {
              const content = value.properties.title[0][0]
              return {
                elements: [
                  ...elements,
                  <components.Equation key={id} displayMode={true}>
                    {content}
                  </components.Equation>,
                ],
                list,
              }
            }
            case 'bulleted_list':
            case 'numbered_list':
              const res = applyChild(list, value)
              list = res.list

              const curTag = listTagName(value)
              if (!res.done) {
                if (list.tag && list.tag !== curTag) {
                  const res = createList(list)
                  elements = [...elements, res.elem]
                  list = res.newList
                }

                list.tag = curTag
                list.contents = [...list.contents, listItem(value)]
              }

              if (index === content.length - 1) {
                const res = createList(list)
                elements = [...elements, res.elem]
                list = res.newList
              }
              return { elements, list }
            default:
              if (process.env.NODE_ENV !== 'production') {
                console.log('unknown type', value.type)
              }
              return { elements, list }
          }
        },
        { elements: [], list: { tag: null, contents: [] } }
      ).elements
    }
  </div>
)

export default RenderPost
