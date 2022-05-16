import { gql } from '@apollo/client'

export const MESSAGE_FIELDS_FRAGMENT = gql`
  fragment MessageFieldsFragment on Message {
    id
    content {
      __typename
      ... on UnstructuredContent {
        text
      }
      ... on MemberRequestAppointment {
        title
      }
    }
    sender {
      id
      name
    }
    sent_at
  }
`
