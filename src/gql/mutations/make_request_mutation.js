import { gql } from '@apollo/client'

export const MAKE_REQUEST_MUTATION = gql`
  mutation MakeRequest(
    $content: String!
    $title: String!
    $requestType: TicketTypes!
  ) {
    makeRequest(content: $content, title: $title, requestType: $requestType) {
      request {
        id
        name
        requestType
        content
      }
    }
  }
`
