import classNames from 'classnames';
import Head from 'next/head';
import 'react-notion-x/src/styles.css';

import A from '../components/a';
import styles from '../styles/App.module.scss';
import '../styles/globals.scss';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (<>
    <Head>
      <title>Team AccelForce</title>
      <link rel="icon" href="/favicon.svg" />
    </Head>
    <div className={classNames(styles.root, styles.dark)}>
      <header className={styles.header}>
        <A className={styles.logo} href="/">
          <svg viewBox="0 0 400 204" width={60} height={30}>
            <use href="/logo.svg#symbol" />
          </svg>
        </A>
      </header>
      <div className={styles.content}>
        <Component {...pageProps} />
      </div>
      <footer className={styles.footer}>
        <p>
          加速を与える力のように<span className={styles.space}>-</span><A href="/">Team AccelForce</A>
        </p>
        <p>
          <A className={styles.space} href="https://odakyu.app/@ars42525" rel="me">@ars42525@odakyu.app</A>
          <A className={styles.space} href="https://github.com/kyori19/accelf.net">Source Code</A>
          <span className={styles.space}>Hosted on <A href="https://vercel.com">Vercel</A></span>
        </p>
      </footer>
    </div>
  </>);
}

export default MyApp;
