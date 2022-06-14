import { Temporal } from '@js-temporal/polyfill';
import Head from 'next/head';

import { blogIndex, pageIndex } from '../../lib/listIndex';
import { loadPage } from '../../lib/loadPage';
import Renderer from '../../lib/renderer';
import { dateFormat } from '../../lib/temporal';
import styles from '../../styles/blog/Slug.module.scss';

import type { Blog } from '../../lib/listIndex';
import type { CommonProps } from '../_app';
import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import type { ExtendedRecordMap } from 'notion-types';

export type PageUrlProps = {
  slug: string;
};

export type PageProps = {
  blog: Blog,
  recordMap: ExtendedRecordMap,
} & CommonProps;

export const getStaticPaths: GetStaticPaths<PageUrlProps> = () => blogIndex()
    .then((blogs) => ({
      paths: blogs.filter(({ published }) => published)
          .map(({ slug }) => ({ params: { slug } })),
      fallback: false,
    }));

export const getStaticProps: GetStaticProps<PageProps, PageUrlProps> = ({ params }) =>
    Promise.all([pageIndex(), blogIndex()])
        .then(async ([pages, blogs]) => {
          const blog = blogs.find(({ slug, published }) => params?.slug === slug && published);
          if (!blog) {
            throw new Error('Page not found');
          }
          return {
            pages: pages.filter(({ header, published }) => header && published),
            blog,
            recordMap: await loadPage(blog.id),
          };
        })
        .then((props) => ({
          props,
          revalidate: 900,
        }))
        .catch((err) => {
          console.error(err);
          return {
            notFound: true,
            revalidate: 900,
          };
        });

const Slug: NextPage<PageProps> = ({ blog, recordMap }) => {
  return (<>
    <Head>
      <title>{blog.title} | Team AccelForce Blog</title>
    </Head>
    <div className={styles.meta}>
      <h1>{blog.title}</h1>
      <table>
        <tbody>
        <tr>
          <th>Date</th>
          <td>{Temporal.PlainDate.from(blog.date).toLocaleString('ja-JP', dateFormat)}</td>
        </tr>
        <tr>
          <th>Author</th>
          <td>{blog.author}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <Renderer recordMap={recordMap} />
  </>);
};

export default Slug;
