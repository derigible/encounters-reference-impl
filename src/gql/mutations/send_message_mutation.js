import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const SEND_MESSAGE_MUTATION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  mutation SendMessage($content: String!, $chatId: ID!) {
    sendMessage(content: $content, chatId: $chatId) {
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
