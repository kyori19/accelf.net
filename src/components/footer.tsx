import ExtLink from './ext-link'
import Link from 'next/link'

const Footer = () => (
  <>
    <footer>
      <p>
        加速を与える力のように - <Link href="/">Team AccelForce</Link>
        <br />
        <ExtLink href="https://odakyu.app/@ars42525" rel="me">
          きょり @ars42525@odakyu.app
        </ExtLink>
      </p>
      <p>
        Made from{' '}
        <ExtLink href="https://github.com/ijjk/notion-blog">
          notion-blog
        </ExtLink>
        .<br />
        Hosted on <ExtLink href="https://vercel.com">Vercel</ExtLink>.<br />
        Source code is published on{' '}
        <ExtLink href="https://github.com/kyori19/accelf.net">GitHub</ExtLink>.
        <br />
        Copyright (c) 2021 kyori and Team AccelForce
      </p>
    </footer>
  </>
)

export default Footer
