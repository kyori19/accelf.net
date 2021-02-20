import rpc from './rpc'
import { User } from './types'

export default async function getNotionUsers(
  ...ids: string[]
): Promise<User[]> {
  const { results = [] } = await rpc('getRecordValues', {
    requests: ids.map((id: string) => ({
      id,
      table: 'notion_user',
    })),
  })

  return results.map(result => {
    const { value } = result
    const { id, given_name, family_name } = value
    let fullName = given_name || ''

    if (family_name && family_name !== '.') {
      fullName = `${fullName} ${family_name}`
    }
    return {
      id,
      fullName,
    }
  })
}
