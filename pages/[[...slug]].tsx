import Head from 'next/head';

import { pageIndex } from '../lib/listIndex';
import { loadPage } from '../lib/loadPage';
import Renderer from '../lib/renderer';
import styles from '../styles/Slug.module.scss';

import type { Page } from '../lib/listIndex';
import type { CommonProps } from './_app';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import type { ExtendedRecordMap } from 'notion-types';

export type PageUrlProps = {
  slug: string[];
};

export type PageProps = {
  page: Page,
  recordMap: ExtendedRecordMap,
} & CommonProps;

export const getStaticPaths: GetStaticPaths<PageUrlProps> = () => pageIndex()
    .then((pages) => ({
      paths: pages.filter(({ published }) => published)
          .map(({ slug }) => ({ params: { slug: slug.split('/') } })),
      fallback: false,
    }));

export const getStaticProps: GetStaticProps<PageProps, PageUrlProps> = ({ params }) => pageIndex()
    .then(async pages => {
      const page = pages.find(({ slug }) => (params?.slug || ['/']).join('/') === slug);
      if (!page) {
        throw new Error('Page not found');
      }
      return {
        pages: pages.filter(({ header }) => header),
        page,
        recordMap: await loadPage(page.id),
      };
    })
    .then(props => ({
      props,
      revalidate: 900,
    }))
    .catch(() => ({
      notFound: true,
      revalidate: 300,
    }));

const Slug: NextPage<PageProps> = ({ page, recordMap }) => {
  return (<>
    <Head>
      <title>{page.title} | Team AccelForce</title>
    </Head>
    <Renderer className={styles.content} recordMap={recordMap} />
  </>);
};

export default Slug;
