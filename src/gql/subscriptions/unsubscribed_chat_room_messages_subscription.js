import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const UNSUBSCRIBED_CHAT_ROOM_MESSAGES = gql`
  ${CHATROOM_FRAGMENT}
  subscription UnsubscribedChatRoomMessages {
    unsubscribed_chat_room_messages {
      chatRoom {
        ...ChatRoomFragment
      }
      isRemoved
    }
  }
`
