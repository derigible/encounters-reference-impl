import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chat_room_fragment'

export const SUBSCRIBE_TO_CHATROOM_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation SubscribeToChat($healthGuideId: ID!, $chatRoomId: ID!) {
    subscribeToChat(
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
