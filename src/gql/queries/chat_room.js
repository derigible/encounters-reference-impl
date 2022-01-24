import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const CHAT_ROOM_QUERY = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  query MessagesForChatRoom($chatRoomId: ID!) {
    chat_room(chat_room_id: $chatRoomId) {
      id
      category
      messages {
        ...MessageFieldsFragment
      }
      owner {
        id
        name
      }
    }
  }
`
