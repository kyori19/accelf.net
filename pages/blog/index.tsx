import Head from 'next/head';

import BlogItem from '../../components/blogItem';
import { blogIndex, pageIndex } from '../../lib/listIndex';
import { loadPage } from '../../lib/loadPage';
import styles from '../../styles/blog/Index.module.scss';

import type { Blog } from '../../lib/listIndex';
import type { CommonProps } from '../_app';
import type { GetStaticProps, NextPage } from 'next';
import type { ExtendedRecordMap } from 'notion-types';

export type BlogWithDesc = {
  desc: ExtendedRecordMap;
} & Blog;

export type PageProps = {
  blogs: BlogWithDesc[],
} & CommonProps;

export const getStaticProps: GetStaticProps<PageProps> = () =>
    Promise.all([
      pageIndex()
          .then((pages) => pages.filter(({ header, published }) => header && published)),
      blogIndex()
          .then((blogs) => blogs.filter(({ published }) => published))
          .then((blogs) => Promise.all(blogs.map(async (blog) => ({
            ...blog,
            desc: await loadPage(blog.id)
                .then((recordMap) => {
                  const blockArray = Object.entries(recordMap.block);
                  const divIndex = blockArray.findIndex(([_, { value: { type } }]) => type === 'divider');
                  return {
                    ...recordMap,
                    block: Object.fromEntries(blockArray.slice(0, divIndex)),
                  };
                }),
          })))),
    ])
        .then(([pages, blogs]) => ({
          pages: pages,
          blogs: blogs,
        }))
        .then((props) => ({
          props,
          revalidate: 900,
        }));

const Index: NextPage<PageProps> = ({ blogs }) => {
  return (<>
    <Head>
      <title>Team AccelForce Blog</title>
    </Head>
    <h1 className={styles.header}>Team AccelForce Blog</h1>
    <div className={styles.container}>
      {blogs.map((blog) => (
          <BlogItem key={blog.id} blog={blog} />
      ))}
    </div>
  </>);
};

export default Index;
