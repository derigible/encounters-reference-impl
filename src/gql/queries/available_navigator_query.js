import { gql } from '@apollo/client'

export const AVAILABLE_NAVIGATORS_QUERY = gql`
  query AvailableNavigators($chatId: ID!) {
    availableNavigators(chatId: $chatId) {
      id
      name
    }
  }
`
