import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const UNSUBSCRIBE_FROM_CHATROOM_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation UnsubscribeFromChat($healthGuideId: ID!, $chatRoomId: ID!) {
    unsubscribeFromChat(
      health_guide_id: $healthGuideId
      chat_room_id: $chatRoomId
    ) {
      errors {
        messages
      }
      chat_room {
        ...ChatRoomFragment
      }
    }
  }
`
