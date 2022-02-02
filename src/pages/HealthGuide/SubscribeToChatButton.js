import React from 'react'
import { useMutation, gql } from '@apollo/client'
import { Button } from '@mui/material'
import { useMessenger } from '@pinkairship/use-messenger'

import { SUBSCRIBE_TO_CHATROOM_MUTATION } from '../../gql/mutations/subscribe_to_chat_mutation'

export default function SubscribeToChatButton({ chatRoomId, healthGuideId }) {
  const { addMessage } = useMessenger()
  const [subscribeToChat] = useMutation(SUBSCRIBE_TO_CHATROOM_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          subscribeToChat: { chat_room, errors },
        },
      }
    ) => {
      const messagesQueryParams = {
        query: gql`
          query ChatRoom($chatRoomId: ID!) {
            chat_room(chat_room_id: $chatRoomId) {
              id
              category
              owner {
                id
                name
              }
            }
          }
        `,
        variables: { chatRoomId },
      }
      if (errors.length > 0) {
        console.log(`[SubscribeToChat]`, errors)
        errors.messages.forEach((m) =>
          addMessage(`[SubscribeToChat] ${m}`, 'error')
        )
      } else {
        console.log('updating through the mutation')
        const chatRoom = currentCache.readQuery(messagesQueryParams)
        currentCache.writeQuery({
          ...messagesQueryParams,
          data: {
            chat_room: {
              ...chatRoom,
              ...chat_room,
            },
          },
        })
      }
    },
  })
  return (
    <Button
      variant="contained"
      onClick={() =>
        subscribeToChat({
          variables: {
            chatRoomId,
            healthGuideId,
          },
        })
      }
    >
      Subscribe to Chat
    </Button>
  )
}
