import React, { ReactNode } from 'react'
import components from '../../components/components'
import { Text } from './blocks'
import Link from 'next/link'

function applyTags(
  tags: string[],
  children: ReactNode,
  noPTag = false,
  key: number
) {
  let child = children

  for (const tag of tags) {
    const props: { [key: string]: any } = { key }
    let tagName: ReactNode = tag[0]

    if (noPTag && tagName === 'p') tagName = React.Fragment
    if (tagName === 'c') tagName = 'code'
    if (tagName === '_') {
      tagName = 'span'
      props.className = 'underline'
    }
    if (tagName === 'a') {
      props.href = tag[1]

      if (/^https:\/\/internal(\/.*)$/.test(tag[1])) {
        tagName = Link
        props.href = tag[1].split('://internal')[1]
      }
    }
    if (tagName === 'e') {
      tagName = components.Equation
      props.displayMode = false
      child = tag[1]
    }
    if (tagName === 'h') {
      tagName = 'span'
      props.className = tag[1]
    }

    child = React.createElement(
      components[tagName as string] || tagName,
      props,
      child
    )
  }
  return child
}

export function textBlock(
  text: Text[],
  noPTag = false,
  mainKey,
  blockClass = ''
) {
  const children = text.reduce((children, text, i) => {
    return [
      ...children,
      text[1] ? applyTags(text[1], text[0], noPTag, i) : text,
    ]
  }, [])

  return React.createElement(
    noPTag ? (blockClass ? 'div' : React.Fragment) : 'p',
    blockClass ? { key: mainKey, className: blockClass } : { key: mainKey },
    ...children,
    noPTag
  )
}
