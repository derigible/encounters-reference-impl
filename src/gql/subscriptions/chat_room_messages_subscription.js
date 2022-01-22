import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const CHAT_ROOM_MESSAGES_SUBSCRIPTION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  subscription ChatRoomMessages($chatRoomId: ID!) {
    chatRoomMessages(chatRoomId: $chatRoomId) {
      chatRoom {
        id
        message {
          ...MessageFieldsFragment
        }
      }
    }
  }
`
