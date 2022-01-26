import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'
import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const M_CHAT_ROOM_QUERY = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  ${CHATROOM_FRAGMENT}
  query MessagesForChatRoom($chatRoomId: ID!) {
    chat_room(chat_room_id: $chatRoomId) {
      ...ChatRoomFragment
      messages {
        ...MessageFieldsFragment
      }
    }
  }
`
