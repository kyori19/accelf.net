import { NotionRenderer } from 'react-notion-x';

import type { ExtendedRecordMap } from 'notion-types';
import type { FC } from 'react';
import type { NotionRendererProps } from 'react-notion-x';

export type RendererProps = Pick<NotionRendererProps, 'className'> & {
  recordMap: ExtendedRecordMap;
};

const Renderer: FC<RendererProps> = ({ className, recordMap }) => (
    <NotionRenderer
        className={className}
        recordMap={recordMap}
        components={{
          collectionRow: () => null,
        }}
    />
);

export default Renderer;
