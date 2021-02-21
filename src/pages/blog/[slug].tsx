import { useRouter } from 'next/router'
import Header from '../../components/header'
import blogStyles from '../../styles/blog.module.css'
import React, { useEffect } from 'react'
import getIndex from '../../lib/notion/getIndex'
import getNotionUsers from '../../lib/notion/getNotionUsers'
import { Blog, Page } from '../../lib/notion/types'
import RenderPost from '../../components/renderPost'
import {
  addTwitterWidget,
  fetchPageData,
  getBlogLink,
  getDateStr,
  postIsPublished,
} from '../../lib/blog-helpers'
import Preview from '../../components/preview'

// Get the data for each blog post
// noinspection JSUnusedGlobalSymbols
export async function getStaticProps({ params: { slug }, preview }) {
  const [pages, post] = await Promise.all([
    getIndex('pages'),
    getIndex('blog')
      .then(posts => posts.find(post => post.Slug === slug))
      .then(async post => {
        await Promise.all([
          fetchPageData(post),
          post.Author &&
            getNotionUsers(post.Author).then(users => {
              post.authorName = users.find(
                user => post.Author === user.id
              ).fullName
            }),
        ])
        return post
      }),
  ])

  // if we can't find the post or if it is unpublished and
  // viewed without preview mode then we just redirect to /blog
  if (!post || (!postIsPublished(post) && !preview)) {
    console.log(`Failed to find post for slug: ${slug}`)
    return {
      props: {
        redirect: '/blog',
        preview: false,
      },
      revalidate: 5,
    }
  }

  return {
    props: {
      post,
      pages,
      preview: preview || false,
    },
    revalidate: 10,
  }
}

// Return our list of blog posts to prerender
// noinspection JSUnusedGlobalSymbols
export async function getStaticPaths() {
  const posts = await getIndex('blog')
  // we fallback for any unpublished posts to save build time
  // for actually published ones
  return {
    paths: posts
      .filter(post => postIsPublished(post))
      .map(post => getBlogLink(post.Slug)),
    fallback: true,
  }
}

const RenderBlog = ({
  post,
  pages,
  redirect,
  preview,
}: {
  post: Blog
  pages: Page[]
  redirect: string
  preview: boolean
}) => {
  const router = useRouter()

  useEffect(addTwitterWidget(post), [])
  useEffect(() => {
    if (redirect && !post) {
      // noinspection JSIgnoredPromiseFromCall
      router.replace(redirect)
    }
  }, [redirect, post])

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // if you don't have a post at this point, and are not
  // loading one from fallback then  redirect back to the index
  if (!post) {
    return (
      <div className={blogStyles.post}>
        <p>
          Whoops! didn't find that post, redirecting you back to the blog index
        </p>
      </div>
    )
  }

  return (
    <>
      <Header titlePre={post.Page} pages={pages} preview={preview} />
      <Preview preview={preview} />
      <div className={blogStyles.post}>
        <h1>{post.Page || ''}</h1>
        {post.authorName && <div className="author">By: {post.authorName}</div>}
        {post.Date && (
          <div className="posted">Posted: {getDateStr(post.Date)}</div>
        )}

        <hr />

        {(!post.content || post.content.length === 0) && (
          <p>This post has no content</p>
        )}

        <RenderPost content={post.content} noRootClass />
      </div>
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
export default RenderBlog
