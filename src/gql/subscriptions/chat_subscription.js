import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const CHATROOM_SUBSCRIPTION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  subscription ChatRoomMessageReceived($chatRoomId: ID!) {
    chatRoomMessages(chatRoomId: $chatRoomId) {
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
