import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const M_CHAT_ROOM_QUERY = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  query MessagesForChatRoom($chatRoomId: ID!) {
    chat_room(chat_room_id: $chatRoomId) {
      category
      messages {
        ...MessageFieldsFragment
      }
    }
  }
`