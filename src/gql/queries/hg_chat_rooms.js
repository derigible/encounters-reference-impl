import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const HG_CHAT_ROOMS_QUERY = gql`
  ${CHATROOM_FRAGMENT}
  query chat_rooms {
    chat_rooms {
      ...ChatRoomFragment
    }
  }
`
