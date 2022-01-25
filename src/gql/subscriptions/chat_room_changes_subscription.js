import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const CHAT_ROOM_CHANGES_SUBSCRIPTION = gql`
  ${CHATROOM_FRAGMENT}
  subscription ChatRoomChanges($chatRoomId: ID!) {
    chatRoomChanges(chat_room_id: $chatRoomId) {
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
