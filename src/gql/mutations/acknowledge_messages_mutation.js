import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const ACKNOWLEDGE_MESSAGES_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation AcknowledgeMessages($chatRoomId: ID!) {
    acknowledgeMessages(chatRoomId: $chatRoomId) {
      chatRoom {
        ...ChatRoomFragment
      }
    }
  }
`
