import Link from 'next/link';
import React from 'react';

import type { LinkProps } from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

export type AProps = Pick<LinkProps, 'href'> &
    Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'rel'>;

const A: React.FC<AProps> = ({ href, children, className, rel }) => (
    <Link href={href}><a className={className} rel={rel}>{children}</a></Link>
);

export default A;
