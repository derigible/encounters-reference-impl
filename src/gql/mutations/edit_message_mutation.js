import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const EDIT_MESSAGE_MUTATION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  mutation EditMessage($messageId: ID!, $content: String!) {
    editMessage(message_id: $messageId, content: $content) {
      errors {
        messages
      }
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
