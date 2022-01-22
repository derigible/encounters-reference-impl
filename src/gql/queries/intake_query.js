import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const INTAKE_QUERY = gql`
  ${CHATROOM_FRAGMENT}
  query IntakeChatRooms {
    intakes {
      ...ChatRoomFragment
    }
  }
`
