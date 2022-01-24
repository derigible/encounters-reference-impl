import { gql } from '@apollo/client'

export const MESSAGE_FIELDS_FRAGMENT = gql`
  fragment MessageFieldsFragment on Message {
    id
    content
    sender {
      id
      name
    }
    sent_at
  }
`
