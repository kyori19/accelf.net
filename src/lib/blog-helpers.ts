import { Post } from './notion/types'
import { implementsTweetBlock } from './notion/blocks'
import getPageData from './notion/getPageData'

export const getPageLink = (slug: string) => {
  return `/${slug || ''}`
}

export const getBlogLink = (slug: string) => {
  return `/blog/${slug}`
}

export const getDateStr = (date: number) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
}

export const postIsPublished = (post: Post) => {
  return post.Published === 'Yes'
}

const processTweets = async (post: Post) => {
  await Promise.all(
    post.content.map(async block => {
      if (implementsTweetBlock(block)) {
        const { properties } = block.value
        const src = properties.source[0][0]
        // parse id from https://twitter.com/_ijjk/status/TWEET_ID format
        const tweetId = src.split('/')[5].split('?')[0]
        if (!tweetId) return

        try {
          const res = await fetch(
            `https://api.twitter.com/1/statuses/oembed.json?id=${tweetId}`
          )
          const json: { html: string } = await res.json()
          properties.html = json.html.split('<script')[0]
          post.hasTweet = true
        } catch (_) {
          console.log(`Failed to get tweet embed for ${src}`)
        }
      }
    })
  )
}

const twitterSrc = 'https://platform.twitter.com/widgets.js'
export const addTwitterWidget = (post: Post) => () => {
  // make sure to initialize any new widgets loading on
  // client navigation
  if (post && post.hasTweet) {
    if ((window as any)?.twttr?.widgets) {
      ;(window as any).twttr.widgets.load()
    } else if (!document.querySelector(`script[src="${twitterSrc}"]`)) {
      const script = document.createElement('script')
      script.async = true
      script.src = twitterSrc
      document.querySelector('body').appendChild(script)
    }
  }
}

export const fetchPageData = async (post: Post) => {
  const postData = await getPageData(post.id)
  post.content = postData.blocks
  await processTweets(post)
}
