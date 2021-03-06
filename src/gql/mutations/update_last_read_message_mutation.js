import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const UPDATE_LAST_READ_MESSAGE_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation UpdateLastReadMessageMutation($chatRoomId: ID!, $messageId: ID!) {
    updateLastReadMessage(chat_room_id: $chatRoomId, message_id: $messageId) {
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
