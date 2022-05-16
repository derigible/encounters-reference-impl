import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const M_CHAT_ROOM_MESSAGES_SUBSCRIPTION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  subscription ChatRoomMessages($chatRoomId: ID!) {
    message_for_chat_rooms(chat_room_id: $chatRoomId) {
      message {
        ...MessageFieldsFragment
      }
      replace
      remove
    }
  }
`
