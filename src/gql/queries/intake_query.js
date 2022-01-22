import { gql } from '@apollo/client'

import { CHAT_FRAGMENT } from '../fragments/chat_fragment'

export const INTAKE_QUERY = gql`
  ${CHAT_FRAGMENT}
  query IntakeChats {
    intakes {
      ...ChatFragment
    }
  }
`
