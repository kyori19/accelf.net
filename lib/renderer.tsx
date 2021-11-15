import { NotionRenderer } from 'react-notion-x';

import A from '../components/a';

import type { ExtendedRecordMap } from 'notion-types';
import type { AnchorHTMLAttributes, FC } from 'react';
import type { NotionRendererProps } from 'react-notion-x';

export type RendererProps = Pick<NotionRendererProps, 'className'> & {
  recordMap: ExtendedRecordMap;
};

const Renderer: FC<RendererProps> = ({ className, recordMap }) => (
    <NotionRenderer
        className={className}
        darkMode={true}
        fullPage={false}
        recordMap={recordMap}
        components={{
          collectionRow: () => null,
          link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
              <A href={href?.replace(/^https:\/\/accelf\.net/, '')} {...rest}>
                {children}
              </A>
          ),
          pageLink: () => {
            console.log('Invalid use of page link!');
          },
        }}
    />
);

export default Renderer;
