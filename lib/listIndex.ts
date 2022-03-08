import { getPropertyData, richTextAsPlainText } from '@jitl/notion-api';
import { Client } from '@notionhq/client';

import type {
  Property} from '@jitl/notion-api';
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

type Row = Extract<QueryDatabaseResponse['results'][number], { properties: Record<string, unknown> }>;

async function index(
    id: string,
): Promise<Row[]> {
  const notion = new Client({ auth: process.env.NOTION_OFFICIAL_TOKEN });
  return await notion.databases
      .query({
        database_id: id,
        sorts: [{
          property: '#',
          direction: 'ascending',
        }],
      })
      .then(({ results }) => results.filter((row): row is Row => 'properties' in row));
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

  return (await index(id))
      .map((row) => ({
        id: row.id,
        title: richTextAsPlainText(getPropertyData(row.properties.Page as Property<'title'>)),
        slug: richTextAsPlainText(getPropertyData(row.properties.Slug as Property<'rich_text'>)),
        header: getPropertyData(row.properties.Header as Property<'checkbox'>),
        published: getPropertyData(row.properties.Published as Property<'checkbox'>),
      }));
}
