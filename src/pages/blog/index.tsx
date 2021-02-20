import Link from 'next/link'
import Header from '../../components/header'

import blogStyles from '../../styles/blog.module.css'
import sharedStyles from '../../styles/shared.module.css'

import { textBlock } from '../../lib/notion/renderers'
import getNotionUsers from '../../lib/notion/getNotionUsers'
import getIndex from '../../lib/notion/getIndex'
import { Blog, Page } from '../../lib/notion/types'
import Preview from '../../components/preview'
import {
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../lib/blog-helpers'

// noinspection JSUnusedGlobalSymbols
export async function getStaticProps({ preview }) {
  const [pages, posts] = await Promise.all([
    getIndex('pages'),
    getIndex('blog')
      .then(posts => posts.filter(post => preview || postIsPublished(post)))
      .then(async posts => {
        const authorsToGet = new Set(
          posts.map(post => post.Author).filter(Boolean)
        )
        const users = await getNotionUsers(...authorsToGet)
        posts.forEach(post => {
          if (post.Author) {
            post.authorName = users.find(
              user => post.Author === user.id
            ).fullName
          }
        })
        return posts
      }),
  ])

  return {
    props: {
      preview: preview || false,
      posts,
      pages,
    },
    revalidate: 10,
  }
}

const Index = ({
  posts = [],
  pages,
  preview,
}: {
  posts: Blog[]
  pages: Page[]
  preview: boolean
}) => {
  return (
    <>
      <Header titlePre="Blog" pages={pages} />
      <Preview preview={preview} />
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h1>Team AccelForce Blog</h1>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map(post => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              <h3>
                <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                  <div className={blogStyles.titleContainer}>
                    {!postIsPublished(post) && (
                      <span className={blogStyles.draftBadge}>Draft</span>
                    )}
                    <a>{post.Page}</a>
                  </div>
                </Link>
              </h3>
              {post.authorName && (
                <div className="authors">By: {post.authorName}</div>
              )}
              {post.Date && (
                <div className="posted">Posted: {getDateStr(post.Date)}</div>
              )}
              <p>
                {(!post.preview || post.preview.length === 0) &&
                  'No preview available'}
                {(post.preview || []).map((block, idx) =>
                  textBlock(block, true, `${post.Slug}${idx}`)
                )}
              </p>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Index
