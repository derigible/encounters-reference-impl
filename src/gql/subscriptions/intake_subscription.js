import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const INTAKE_SUBSCRIPTION = gql`
  ${CHATROOM_FRAGMENT}
  subscription IntakeRecieved {
    intakes {
      chatRoom {
        ...ChatRoomFragment
      }
      isRemoved
    }
  }
`
