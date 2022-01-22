import { gql } from '@apollo/client'

export const AVAILABLE_HEALTH_GUIDES_QUERY = gql`
  query AvailableHealthGuides($chatRoomId: ID!) {
    availableHealthGuides(chatRoomId: $chatRoomId) {
      id
      name
    }
  }
`
