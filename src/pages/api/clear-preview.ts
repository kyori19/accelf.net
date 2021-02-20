import { NextApiRequest, NextApiResponse } from 'next'

// noinspection JSUnusedGlobalSymbols
export default (req: NextApiRequest, res: NextApiResponse) => {
  res.clearPreviewData()
  res.writeHead(307, { Location: `/` })
  res.end()
}
