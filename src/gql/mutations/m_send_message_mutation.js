import { gql } from '@apollo/client'

import { MESSAGE_FIELDS_FRAGMENT } from '../fragments/message_fragment'

export const M_SEND_MESSAGE_MUTATION = gql`
  ${MESSAGE_FIELDS_FRAGMENT}
  mutation SendMessage($content: String!, $chatRoomId: ID!) {
    send_message(content: $content, chat_room_id: $chatRoomId) {
      message {
        ...MessageFieldsFragment
      }
    }
  }
`
