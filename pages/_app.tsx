import Image from 'next/image';

import '../styles/globals.scss';

import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <header>
        <Image src={logo} alt='Team AccelForce' />
      </header>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
