import { gql } from '@apollo/client'

export const AVAILABLE_NAVIGATORS_QUERY = gql`
  query AvailableHealthGuides($chatId: ID!) {
    availableHealthGuides(chatId: $chatId) {
      id
      name
    }
  }
`
