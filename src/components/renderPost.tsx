import components from './components'
import { textBlock } from '../lib/notion/renderers'
import React, { ComponentType, CSSProperties } from 'react'
import Heading from './heading'
import {
  Block,
  HeaderBlockValue,
  implementsListBlock,
} from '../lib/notion/blocks'
import blogStyles from '../styles/blog.module.css'
import JsxParser from 'react-jsx-parser'

const headingTags: {
  [key in HeaderBlockValue['type']]: string | ComponentType
} = {
  header: 'h1',
  sub_header: 'h2',
  sub_sub_header: 'h3',
}

const RenderPost = ({
  content = [],
  noRootClass = false,
}: {
  content: Block[]
  noRootClass?: boolean
}) => {
  let listTagName: string | null = null
  let listLastId: string | null = null
  let listMap: {
    [id: string]: {
      key: string
      isNested?: boolean
      nested: string[]
      children: React.ReactFragment
    }
  } = {}

  return (
    <div className={noRootClass ? undefined : blogStyles.post}>
      {content.map((block, blockIdx) => {
        const { value } = block
        const { id } = value
        const isLast = blockIdx === content.length - 1
        let toRender = []

        if (listTagName && (isLast || !implementsListBlock(block))) {
          toRender.push(
            React.createElement(
              listTagName,
              { key: listLastId! },
              Object.keys(listMap).map(itemId => {
                if (listMap[itemId].isNested) return null

                const createEl = item =>
                  React.createElement(
                    'li',
                    { key: item.key },
                    item.children,
                    item.nested.length > 0
                      ? React.createElement(
                          'ul',
                          { key: item + 'sub-list' },
                          item.nested.map(nestedId =>
                            createEl(listMap[nestedId])
                          )
                        )
                      : null
                  )
                return createEl(listMap[itemId])
              })
            )
          )
          listMap = {}
          listLastId = null
          listTagName = null
        }

        switch (value.type) {
          case 'page':
          case 'divider':
            break
          case 'text':
            if (value.properties) {
              toRender.push(textBlock(value.properties.title, false, id))
            }
            break
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
                    height: block_height * rate,
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

            toRender.push(
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
              )
            )
            break
          }
          case 'header':
          case 'sub_header':
          case 'sub_sub_header':
            const Tag = headingTags[value.type]
            toRender.push(
              <Heading key={id}>
                <Tag key={id}>
                  {textBlock(value.properties.title, true, id)}
                </Tag>
              </Heading>
            )
            break
          case 'code': {
            if (value.properties.title) {
              const content = value.properties.title[0][0]
              const language = value.properties.language[0][0]

              if (language === 'LiveScript') {
                // this requires the DOM for now
                toRender.push(
                  <JsxParser
                    key={id}
                    jsx={content}
                    components={components}
                    componentsOnly={false}
                    allowUnknownElements={true}
                    blacklistedTags={['script', 'style']}
                  />
                )
              } else {
                toRender.push(
                  <components.Code key={id} language={language || ''}>
                    {content}
                  </components.Code>
                )
              }
            }
            break
          }
          case 'quote': {
            if (value.properties.title) {
              toRender.push(
                React.createElement(
                  'blockquote',
                  { key: id },
                  value.properties.title
                )
              )
            }
            break
          }
          case 'callout': {
            toRender.push(
              <div className="callout" key={id}>
                {value.format?.page_icon && (
                  <div>{value.format?.page_icon}</div>
                )}
                <div className="text">
                  {textBlock(value.properties.title, true, id)}
                </div>
              </div>
            )
            break
          }
          case 'tweet': {
            if (value.properties.html) {
              toRender.push(
                <div
                  dangerouslySetInnerHTML={{ __html: value.properties.html }}
                  key={id}
                />
              )
            }
            break
          }
          case 'equation': {
            if (value.properties && value.properties.title) {
              const content = value.properties.title[0][0]
              toRender.push(
                <components.Equation key={id} displayMode={true}>
                  {content}
                </components.Equation>
              )
            }
            break
          }
          case 'bulleted_list':
          case 'numbered_list':
            listTagName =
              components[value.type === 'bulleted_list' ? 'ul' : 'ol']
            listLastId = `list${id}`

            listMap[id] = {
              key: id,
              nested: [],
              children: textBlock(value.properties.title, true, id),
            }

            if (listMap[value.parent_id]) {
              listMap[id].isNested = true
              listMap[value.parent_id].nested.push(id)
            }
            break
          default:
            if (process.env.NODE_ENV !== 'production') {
              console.log('unknown type', value.type)
            }
            break
        }
        return toRender
      })}
    </div>
  )
}

export default RenderPost
