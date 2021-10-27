import { pageIndex } from '../lib/listIndex';
import { loadPage } from '../lib/loadPage';

import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';

export type PageUrlProps = {
  slug: string[];
};

export type PageProps = {};

export const getStaticPaths: GetStaticPaths<PageUrlProps> = () => pageIndex()
    .then((pages) => ({
      paths: pages.map(({ slug }) => ({ params: { slug: slug.split('/') } })),
      fallback: false,
    }));

export const getStaticProps: GetStaticProps<PageProps, PageUrlProps> = ({ params }) => pageIndex()
    .then(async pages => ({
      pages,
      recordMap: await loadPage((() => {
        const page = pages.find(({ slug }) => (params?.slug || ['/']).join('/') === slug);
        if (!page) {
          throw new Error('Page not found');
        }
        return page.id;
      })()),
    }))
    .then(({ pages, recordMap }) => ({
      props: { pages, recordMap },
      revalidate: 600,
    }))
    .catch(() => ({
      notFound: true,
      revalidate: 600,
    }));

const Slug: NextPage<PageProps> = ({}) => {
  return (<>
    <span>test</span>
  </>);
};

export default Slug;
