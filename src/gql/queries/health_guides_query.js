import { gql } from '@apollo/client'

export const AVAILABLE_HEALTH_GUIDES_QUERY = gql`
  query AvailableHealthGuides($chatRoomId: ID) {
    available_health_guides(chat_room_id: $chatRoomId) {
      id
      name
    }
  }
`
