import '../styles/global.css'
import 'katex/dist/katex.css'
import Footer from '../components/footer'

const App = ({ Component, pageProps }) => (
  <>
    <Component {...pageProps} />
    <Footer />
  </>
)

// noinspection JSUnusedGlobalSymbols
export default App
