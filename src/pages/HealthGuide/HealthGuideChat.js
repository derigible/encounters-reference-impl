import { Button } from '@mui/material'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { CHAT_ROOM_QUERY } from '../../gql/queries/chat_room'
import { SEND_MESSAGE_MUTATION } from '../../gql/mutations/send_message_mutation'

export default function HealthGuideChat(currentUserId) {
  const { addMessage } = useMessenger()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { id: chatRoomId } = useParams()

  const updateQuery = (prev, { subscriptionData }) => {
    console.log('updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.chat_room_messages.message
    return {
      ...prev,
      chatRoom: {
        ...prev.chatRoom,
        messages: [...prev.chatRoom.messages, newChatMessage],
      },
    }
  }
  const update = (
    currentCache,
    {
      data: {
        sendMessage: { message, errors },
      },
    }
  ) => {
    const messagesQueryParams = {
      query: CHAT_ROOM_QUERY,
      variables: { chatRoomId },
    }

    if (errors.length > 0) {
      console.log(`[SendMessageErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) => addMessage(`[SendMessage] ${m}`, 'error'))
      )
    } else {
      console.log('updating through the mutation')
      const chatRoom = currentCache.readQuery(messagesQueryParams)
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...chatRoom.chat_room,
            messages: [...chatRoom.chat_room.messages, message],
          },
        },
      })
    }
  }
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => navigate(`/health_guide?${searchParams}`)}
      >
        Back to Dashboard
      </Button>
      <ChatRoom
        chatRoomId={chatRoomId}
        chatRoomQuery={CHAT_ROOM_QUERY}
        sendMessageMutation={SEND_MESSAGE_MUTATION}
        updateQuery={updateQuery}
        update={update}
        currentUserId={currentUserId}
      />
    </div>
  )
}
