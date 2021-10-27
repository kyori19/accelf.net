import { Client } from '@notionhq/client';

import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

async function index<T>(
    id: string,
    converter: (id: string, row: QueryDatabaseResponse['results'][number]['properties']) => T,
): Promise<T[]> {
  const notion = new Client({ auth: process.env.NOTION_OFFICIAL_TOKEN });
  return await notion.databases.query({ database_id: id })
      .then(({ results }) => results.map(({ id, properties }) => converter(id, properties)));
}

export type Page = {
  id: string;
  title: string;
  slug: string;
  header: boolean;
  published: boolean;
};

export async function pageIndex(): Promise<Page[]> {
  const id = process.env.PAGE_INDEX;

  if (!id) {
    throw new Error('PAGE_INDEX not set');
  }

  return await index(
      id,
      (id, { Page, Slug, Header, Published }) => ({
        id: id,
        title: (Page.type === 'title') && (Page.title[0].type === 'text') && Page.title[0].text.content || '',
        slug: (Slug.type === 'rich_text') && (Slug.rich_text[0].type === 'text') && Slug.rich_text[0].text.content || '',
        header: (Header.type === 'checkbox') && Header.checkbox,
        published: (Published.type === 'checkbox') && Published.checkbox,
      }),
  );
}
