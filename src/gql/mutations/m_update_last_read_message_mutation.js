import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const M_UPDATE_LAST_READ_MESSAGE_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation UpdateLastReadMessageMutation($chatRoomId: ID!, $messageId: ID!) {
    update_last_read_message(
      chat_room_id: $chatRoomId
      message_id: $messageId
    ) {
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
