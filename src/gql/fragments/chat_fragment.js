import { gql } from '@apollo/client'

export const CHAT_FRAGMENT = gql`
  fragment ChatFragment on Chat {
    id
    category
    owner {
      name
    }
  }
`
