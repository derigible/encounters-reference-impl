import { gql } from '@apollo/client'

import { CHAT_FRAGMENT } from '../fragments/chat_fragment'

export const INTAKE_SUBSCRIPTION = gql`
  ${CHAT_FRAGMENT}
  subscription IntakeRecieved {
    intakes {
      chat {
        ...ChatFragment
      }
      isRemoved
    }
  }
`
