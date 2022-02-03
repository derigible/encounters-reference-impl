import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const DELETE_MESSAGE_MUTATION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(message_id: $messageId) {
      errors {
        messages
      }
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
