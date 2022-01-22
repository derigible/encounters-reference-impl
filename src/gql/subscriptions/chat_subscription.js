import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const CHAT_SUBSCRIPTION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  subscription ChatMessageReceived($chatId: ID!) {
    chatMessages(chatId: $chatId) {
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
