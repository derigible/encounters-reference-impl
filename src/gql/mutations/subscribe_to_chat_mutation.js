import { gql } from '@apollo/client'

import { CHAT_FRAGMENT } from '../fragments/chat_fragment'

export const SUBSCRIBE_TO_CHAT_MUTATION = gql`
  ${CHAT_FRAGMENT}
  mutation SubscribeToChat($navigatorId: ID!, $chatId: ID!) {
    subscribeToChat(navigatorId: $navigatorId, chatId: $chatId) {
      chat {
        ...ChatFragment
      }
    }
  }
`
