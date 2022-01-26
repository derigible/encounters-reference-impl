import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { CHAT_ROOM_QUERY } from '../../gql/queries/chat_room'
import { SEND_MESSAGE_MUTATION } from '../../gql/mutations/send_message_mutation'
import { UPDATE_LAST_READ_MESSAGE_MUTATION } from '../../gql/mutations/update_last_read_message_mutation'
import { Typography } from '@mui/material'

export default function HealthGuideChat({
  currentUser,
  currentHealthGuideId,
  chatRoom,
  setActiveMessagesCount,
  incrementMessagesCount,
  closeChat,
}) {
  const { addMessage } = useMessenger()

  const updateQuery = (prev, { subscriptionData }) => {
    console.log('[SendMessage] updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.chat_room_messages.message
    const messages = [...prev.chat_room.messages, newChatMessage]
    incrementMessagesCount()
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
      variables: { chatRoomId: chatRoom.id },
    }

    if (errors.length > 0) {
      console.log(`[SendMessageErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) => addMessage(`[SendMessage] ${m}`, 'error'))
      )
    } else {
      console.log('[SendMessage] updating through the mutation')
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
      incrementMessagesCount()
    }
  }
  const updateRead = (
    currentCache,
    {
      data: {
        updateLastReadMessage: { chat_room, errors },
      },
    }
  ) => {
    const messagesQueryParams = {
      query: CHAT_ROOM_QUERY,
      variables: { chatRoomId: chatRoom.id },
    }

    if (errors && errors.length > 0) {
      console.log(`[UpdateLastReadMessageErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) =>
          addMessage(`[UpdateLastReadMessage] ${m}`, 'error')
        )
      )
    } else {
      console.log('updating through the mutation')
      const chatRoom = currentCache.readQuery(messagesQueryParams)
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...chatRoom.chat_room,
            ...chat_room,
          },
        },
      })
    }
  }
  return (
    <div>
      <ChatRoom
        chatRoomId={chatRoom.id}
        chatRoomQuery={CHAT_ROOM_QUERY}
        sendMessageMutation={SEND_MESSAGE_MUTATION}
        updateReadMutation={UPDATE_LAST_READ_MESSAGE_MUTATION}
        updateFromUpdateReadMut={updateRead}
        updateQuery={updateQuery}
        update={update}
        currentUserId={currentUser.Id}
        setActiveMessagesCount={setActiveMessagesCount}
        closeChat={closeChat}
        isOwner={(m) =>
          m.sender &&
          m.sender.id === currentHealthGuideId &&
          m.sender.__typename === 'HealthGuide'
        }
        currentLastMessageForUser={
          chatRoom.participants.nodes.find(
            (p) =>
              p.sender.id == currentHealthGuideId &&
              p.sender.__typename == 'HealthGuide'
          ).last_read_message_id
        }
        participants={chatRoom.participants.nodes}
      />
    </div>
  )
}
