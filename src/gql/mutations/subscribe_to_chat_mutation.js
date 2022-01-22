import { gql } from '@apollo/client'

import { CHATROOM_FRAGMENT } from '../fragments/chatRoom_fragment'

export const SUBSCRIBE_TO_CHATROOM_MUTATION = gql`
  ${CHATROOM_FRAGMENT}
  mutation SubscribeToChat($health_guideId: ID!, $chatRoomId: ID!) {
    subscribeToChat(health_guideId: $health_guideId, chatRoomId: $chatRoomId) {
      chatRoom {
        ...ChatRoomFragment
      }
    }
  }
`
