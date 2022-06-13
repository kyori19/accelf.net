import { getPropertyData, richTextAsPlainText } from '@jitl/notion-api';
import { Client } from '@notionhq/client';

import type { Property } from '@jitl/notion-api';
import type { QueryDatabaseParameters, QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

type Row = Extract<QueryDatabaseResponse['results'][number], { properties: Record<string, unknown> }>;

type CommonProps = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
};

async function index(
    id: string,
    sort: Exclude<QueryDatabaseParameters['sorts'], undefined>[number],
): Promise<{ row: Row, common: CommonProps }[]> {
  const notion = new Client({ auth: process.env.NOTION_OFFICIAL_TOKEN });
  return await notion.databases
      .query({
        database_id: id,
        sorts: [sort],
      })
      .then(({ results }) =>
          results.filter((row): row is Row => 'properties' in row)
              .map((row) => ({
                row,
                common: {
                  id: row.id,
                  title: richTextAsPlainText(getPropertyData(row.properties.Page as Property<'title'>)),
                  slug: richTextAsPlainText(getPropertyData(row.properties.Slug as Property<'rich_text'>)),
                  published: getPropertyData(row.properties.Published as Property<'checkbox'>),
                },
              })),
      );
}

export type Page = CommonProps & {
  header: boolean;
};

export async function pageIndex(): Promise<Page[]> {
  const id = process.env.PAGE_INDEX;

  if (!id) {
    throw new Error('PAGE_INDEX not set');
  }

  return (await index(id, { property: '#', direction: 'ascending' }))
      .map(({ common, row }) => ({
        ...common,
        header: getPropertyData(row.properties.Header as Property<'checkbox'>),
      }));
}

export type Blog = CommonProps & {
  author: string;
  date: string;
};

export async function blogIndex(): Promise<Blog[]> {
  const id = process.env.BLOG_INDEX;

  if (!id) {
    throw new Error('BLOG_INDEX not set');
  }

  return (await index(id, { property: 'Date', direction: 'descending' }))
      .map(({ common, row }) => ({
        ...common,
        author: (getPropertyData(row.properties.Author as Property<'people'>)[0] as { name: string }).name,
        date: getPropertyData(row.properties.Date as Property<'date'>)?.start || '',
      }));
}
