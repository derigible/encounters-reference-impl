import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const UPDATE_LAST_READ_MESSAGE_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation UpdateLastReadMessageMutation($chatRoomId: ID!, $messageId: ID!) {
    updateLastReadMessage(chatRoomId: $chatRoomId) {
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
