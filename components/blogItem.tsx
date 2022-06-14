import { Temporal } from '@js-temporal/polyfill';

import Renderer from '../lib/renderer';
import { dateFormat } from '../lib/temporal';
import styles from '../styles/components/BlogItem.module.scss';

import A from './a';

import type { BlogWithDesc } from '../pages/blog';
import type { FC } from 'react';

export type BlogItemProps = {
  blog: BlogWithDesc,
};

const BlogItem: FC<BlogItemProps> = ({ blog: { author, date, title, desc, slug } }) => (
    <div className={styles.container}>
      <div className={styles.meta}>
        <p>{Temporal.PlainDate.from(date).toLocaleString('ja-JP', dateFormat)}</p>
        <p className={styles.author}>{author}</p>
      </div>
      <div className={styles.main}>
        <A href={`/blog/${slug}`}><h2>{title}</h2></A>
        <Renderer className={styles.desc} recordMap={desc} />
      </div>
    </div>
);

export default BlogItem;
