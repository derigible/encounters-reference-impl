import { gql } from '@apollo/client'

export const MAKE_REQUEST_MUTATION = gql`
  mutation MakeRequest(
    $content: String!
    $ticketTypeId: ID!
  ) {
    makeRequest(content: $content, ticket_type_id: $ticketTypeId) {
      errors {
        messages
      }
      member_request {
        id
        member {
          name
        }
        sent_at
        content
      }
    }
  }
`
