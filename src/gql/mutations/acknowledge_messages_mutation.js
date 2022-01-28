import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const ACKNOWLEDGE_MESSAGES_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation AcknowledgeMessages($chatRoomId: ID!) {
    acknowledgeMessages(chat_room_id: $chatRoomId) {
      errors {
        messages
      }
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
