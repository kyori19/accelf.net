import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { NotionRenderer } from 'react-notion-x';

import A from '../components/a';

import type { ExtendedRecordMap } from 'notion-types';
import type { AnchorHTMLAttributes, FC } from 'react';

const Code = dynamic<never>(() =>
    import('react-notion-x/build/third-party/code').then(async (m) => {
      await Promise.all([
        import('prismjs/components/prism-markup-templating.js'),
        import('prismjs/components/prism-markup.js'),
        import('prismjs/components/prism-bash.js'),
        import('prismjs/components/prism-c.js'),
        import('prismjs/components/prism-cpp.js'),
        import('prismjs/components/prism-csharp.js'),
        import('prismjs/components/prism-docker.js'),
        import('prismjs/components/prism-java.js'),
        import('prismjs/components/prism-js-templates.js'),
        import('prismjs/components/prism-coffeescript.js'),
        import('prismjs/components/prism-diff.js'),
        import('prismjs/components/prism-git.js'),
        import('prismjs/components/prism-go.js'),
        import('prismjs/components/prism-graphql.js'),
        import('prismjs/components/prism-handlebars.js'),
        import('prismjs/components/prism-less.js'),
        import('prismjs/components/prism-makefile.js'),
        import('prismjs/components/prism-markdown.js'),
        import('prismjs/components/prism-objectivec.js'),
        import('prismjs/components/prism-ocaml.js'),
        import('prismjs/components/prism-python.js'),
        import('prismjs/components/prism-reason.js'),
        import('prismjs/components/prism-rust.js'),
        import('prismjs/components/prism-sass.js'),
        import('prismjs/components/prism-scss.js'),
        import('prismjs/components/prism-solidity.js'),
        import('prismjs/components/prism-sql.js'),
        import('prismjs/components/prism-stylus.js'),
        import('prismjs/components/prism-swift.js'),
        import('prismjs/components/prism-wasm.js'),
        import('prismjs/components/prism-yaml.js'),
      ]);
      return m.Code;
    }) as never,
);

export type RendererProps = {
  className?: string;
  recordMap: ExtendedRecordMap;
};

const Renderer: FC<RendererProps> = ({ className, recordMap }) => (
    <NotionRenderer
        className={className}
        darkMode={true}
        fullPage={false}
        recordMap={recordMap}
        components={{
          Code: Code,
          Collection: () => null,
          Link: ({ href, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
              <A href={href?.replace(/^https:\/\/accelf\.net/, '')} {...rest}>
                {children}
              </A>
          ),
          PageLink: () => {
            console.log('Invalid use of page link!');
          },
          nextImage: Image,
          nextLink: Link,
        }}
    />
);

export default Renderer;
