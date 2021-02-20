import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import Header from '../components/header'
import getIndex from '../lib/notion/getIndex'
import {
  addTwitterWidget,
  fetchPageData,
  getPageLink,
  postIsPublished,
} from '../lib/blog-helpers'
import { Page } from '../lib/notion/types'
import blogStyles from '../styles/blog.module.css'
import Preview from '../components/preview'
import RenderPost from '../components/renderPost'

// noinspection JSUnusedGlobalSymbols
export async function getStaticProps({
  params: { slug = [] },
  preview,
}: {
  params: {
    slug: string[]
  }
  preview: any
}) {
  const path = slug.join('/')
  const pages = await getIndex('pages')
  const post = pages.find(post => post.Slug === path)

  if (!post || (!postIsPublished(post) && !preview)) {
    console.log(`Failed to find post for slug: ${path}`)
    return {
      props: {
        redirect: `/`,
        preview: false,
      },
      revalidate: 5,
    }
  }

  await fetchPageData(post)

  return {
    props: {
      post,
      pages,
      preview: preview || false,
    },
    revalidate: 10,
  }
}

// noinspection JSUnusedGlobalSymbols
export async function getStaticPaths() {
  const postsTable = await getIndex('pages')
  return {
    paths: postsTable
      .filter(post => postIsPublished(post))
      .map(post => getPageLink(post.Slug)),
    fallback: true,
  }
}

const RenderPage = ({
  post,
  pages,
  redirect,
  preview,
}: {
  post: Page
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
          Whoops! didn't find that page, redirecting you back to the site index
        </p>
      </div>
    )
  }

  return (
    <>
      <Header titlePre={post.Page} pages={pages} />
      <Preview preview={preview} />
      <RenderPost content={post.content} />
    </>
  )
}

// noinspection JSUnusedGlobalSymbols
export default RenderPage
