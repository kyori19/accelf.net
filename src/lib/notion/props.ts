type Date = {
  0: 'd'
  1: {
    type: 'date'
    start_date: string
    start_time?: string
    time_zone?: string
  }
}

type Link = {
  0: 'a'
  1: string
}

type Page = {
  0: 'p'
  1: string
}

type User = {
  0: 'u'
  1: string
}

export type PropType = Date | Link | Page | User

export type PropVal = {
  0: string
  1?: PropType
}
