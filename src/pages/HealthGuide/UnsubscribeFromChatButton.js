import { useMutation, gql } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'

import { Button } from '@mui/material'

import { UNSUBSCRIBE_FROM_CHATROOM_MUTATION } from '../../gql/mutations/unsubscribe_from_chat_mutation'

export default function UnsubscribeFromChatButton({
  chatRoomId,
  healthGuideId,
}) {
  const { addMessage } = useMessenger()
  const [unsubscribeFromChat] = useMutation(
    UNSUBSCRIBE_FROM_CHATROOM_MUTATION,
    {
      update: (
        currentCache,
        {
          data: {
            unsubscribeFromChat: { chat_room, errors },
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
          console.log(`[UnsubscribeFromChat]`, errors)
          errors.messages.forEach((m) =>
            addMessage(`[UnsubscribeFromChat] ${m}`, 'error')
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
    }
  )
  return (
    <Button
      variant="outlined"
      onClick={() =>
        unsubscribeFromChat({
          variables: {
            chatRoomId,
            healthGuideId,
          },
        })
      }
      style={{ marginRight: '0.25em' }}
    >
      Unsubscribe from Chat
    </Button>
  )
}
