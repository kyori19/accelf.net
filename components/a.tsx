import Link from 'next/link';

import type { AnchorHTMLAttributes, FC } from 'react';

export type AProps = AnchorHTMLAttributes<HTMLAnchorElement>;

const A: FC<AProps> = ({ href, children, ...rest }) =>
    href?.startsWith('/')
        ? (
            <Link href={href}>
              <a {...rest}>
                {children}
              </a>
            </Link>
        )
        : (
            <a href={href} target='_blank' rel='noopener noreferrer' {...rest}>
              {children}
            </a>
        );

export default A;
