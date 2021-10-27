import { NotionAPI } from 'notion-client';

const notion: NotionAPI = new NotionAPI({ authToken: process.env.NOTION_UNOFFICIAL_TOKEN });

export const loadPage = (id: string) => notion.getPage(id);
