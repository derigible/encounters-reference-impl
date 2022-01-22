import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const MESSAGES_QUERY = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  query MessagesForChat($chatId: ID!) {
    chat(chatId: $chatId) {
      category
      messages {
        ...MessageFieldsFragment
      }
    }
  }
`
