import { gql } from '@apollo/client'

import { CHAT_FRAGMENT } from '../fragments/chat_fragment'

export const ACKNOWLEDGE_MESSAGES_MUTATION = gql`
  ${CHAT_FRAGMENT}
  mutation AcknowledgeMessages($chatId: ID!) {
    acknowledgeMessages(chatId: $chatId) {
      chat {
        ...ChatFragment
      }
    }
  }
`
