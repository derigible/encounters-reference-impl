import { gql } from '@apollo/client'

export const AVAILABLE_NAVIGATORS_QUERY = gql`
  query AvailableHealthGuides($chatRoomId: ID!) {
    availableHealthGuides(chatRoomId: $chatRoomId) {
      id
      name
    }
  }
`
