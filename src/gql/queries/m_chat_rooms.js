import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const M_CHAT_ROOMS_QUERY = gql`
  query chat_rooms {
    chat_rooms {
      category
      id
      owner {
        id
        name
      }
    }
  }
`
