import dynamic from 'next/dynamic'
import ExtLink from './ext-link'

const components = {
  a: ExtLink,

  Code: dynamic(() => import('./code')),
  Counter: dynamic(() => import('./counter')),
  Equation: dynamic(() => import('./equation')),
}

export default components
