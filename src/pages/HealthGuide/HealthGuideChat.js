import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { CHAT_ROOM_QUERY } from '../../gql/queries/chat_room'
import { SEND_MESSAGE_MUTATION } from '../../gql/mutations/send_message_mutation'
import { Typography } from '@mui/material'

export default function HealthGuideChat({
  currentUserId,
  chatRoomId,
  notifyNewMessage,
  setActiveMessagesCount,
}) {
  const { addMessage } = useMessenger()

  if (!chatRoomId) {
    return <Typography>Select a Chat to Join</Typography>
  }

  const updateQuery = (prev, { subscriptionData }) => {
    console.log('updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.chat_room_messages.message
    const messages = [...prev.chat_room.messages, newChatMessage]
    notifyNewMessage()
    setActiveMessagesCount(messages.length)
    return {
      ...prev,
      chat_room: {
        ...prev.chat_room,
        messages,
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
      const messages = [...chatRoom.chat_room.messages, message]
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...chatRoom.chat_room,
            messages,
          },
        },
      })
      setActiveMessagesCount(messages.length)
    }
  }
  return (
    <div>
      <ChatRoom
        chatRoomId={chatRoomId}
        chatRoomQuery={CHAT_ROOM_QUERY}
        sendMessageMutation={SEND_MESSAGE_MUTATION}
        updateQuery={updateQuery}
        update={update}
        currentUserId={currentUserId}
        setActiveMessagesCount={setActiveMessagesCount}
      />
    </div>
  )
}
