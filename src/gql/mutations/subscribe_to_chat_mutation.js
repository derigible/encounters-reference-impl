import { gql } from '@apollo/client'

import { CHAT_FRAGMENT } from '../fragments/chat_fragment'

export const SUBSCRIBE_TO_CHAT_MUTATION = gql`
  ${CHAT_FRAGMENT}
  mutation SubscribeToChat($health_guideId: ID!, $chatId: ID!) {
    subscribeToChat(health_guideId: $health_guideId, chatId: $chatId) {
      chat {
        ...ChatFragment
      }
    }
  }
`
