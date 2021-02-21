import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'
import { Page } from '../lib/notion/types'
import { getPageLink, postIsPublished } from '../lib/blog-helpers'

const Header = ({
  titlePre = '',
  pages,
  preview,
}: {
  titlePre: string
  pages: Page[]
  preview: boolean
}) => {
  const { asPath: path } = useRouter()

  const headers = pages
    .filter(page => preview || postIsPublished(page))
    .filter(page => page.Header === 'Yes')

  return (
    <header className={styles.header}>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ''} Team AccelForce</title>
      </Head>
      <ul>
        {headers.map(({ Page, Slug }) => (
          <li key={Page}>
            <Link href={getPageLink(Slug)}>
              <a className={path === getPageLink(Slug) ? 'active' : undefined}>
                {Page}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </header>
  )
}

export default Header
