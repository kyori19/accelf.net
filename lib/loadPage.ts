import { NotionAPI } from 'notion-client';

export const loadPage = (id: string) => (new NotionAPI({ authToken: process.env.NOTION_UNOFFICIAL_TOKEN })).getPage(id);
