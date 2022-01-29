import { useState } from 'react'
import { useMessenger } from '@pinkairship/use-messenger'
import { useQuery } from '@apollo/client'

import ChatRoom from '../../../components/ChatRoom'
import { CHAT_ROOM_QUERY } from '../../../gql/queries/chat_room'
import { AVAILABLE_HEALTH_GUIDES_QUERY } from '../../../gql/queries/available_health_guides_query'
import { SEND_MESSAGE_MUTATION } from '../../../gql/mutations/send_message_mutation'
import { UPDATE_LAST_READ_MESSAGE_MUTATION } from '../../../gql/mutations/update_last_read_message_mutation'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'

export default function HealthGuideChat({
  currentUser,
  currentHealthGuideId,
  chatRoom,
  setActiveMessagesCount,
  incrementMessagesCount,
  closeChat,
}) {
  const { addMessage } = useMessenger()
  const [selectedHealthGuide, setSelectedHealthGuide] = useState('')
  const { data, loading, error } = useQuery(AVAILABLE_HEALTH_GUIDES_QUERY, {
    variables: { chatRoomId: chatRoom.id },
    onCompleted: (completedData) =>
      setSelectedHealthGuide(completedData.available_health_guides[0].id),
  })

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
    if (errors.length > 0) {
      console.log(`[SendMessageErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) => addMessage(`[SendMessage] ${m}`, 'error'))
      )
    } else {
      console.log('[SendMessage] updating through the mutation')
      const messagesQueryParams = {
        query: CHAT_ROOM_QUERY,
        variables: { chatRoomId: chatRoom.id },
      }
      const cRoom = currentCache.readQuery(messagesQueryParams)
      const messages = [...cRoom.chat_room.messages, message]
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...cRoom.chat_room,
            participants: [
              ...cRoom.chat_room.participants.filter(
                (p) => p.sender.id === message.sender.id
              ),
              {
                ...cRoom.chat_room.paricipants.find(
                  (p) => p.sender.id === message.sender.id
                ),

                last_read_message_id: message.id,
              },
            ],
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
      const cRoom = currentCache.readQuery(messagesQueryParams)
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...cRoom.chat_room,
            ...chat_room,
          },
        },
      })
    }
  }
  if (
    !chatRoom.participants.nodes.find(
      (p) =>
        p.sender.id == currentHealthGuideId &&
        p.sender.__typename == 'HealthGuide'
    )
  ) {
    return <div>You were unsubscribed. Resubscribe to see this chat</div>
  }
  return (
    <div>
      <FormControl>
        <InputLabel id="availableHealthGuides">
          Available Health Guides
        </InputLabel>
        <Select
          labelId="availableHealthGuides"
          id="availableHealthGuidesSelect"
          value={selectedHealthGuide}
          label="Available Health Guides"
          onChange={(e) => {
            setSelectedHealthGuide(e.target.value)
          }}
        >
          {!loading && !error
            ? data.available_health_guides.map((hg) => (
                <MenuItem value={hg.id} key={hg.id}>
                  {hg.name}
                </MenuItem>
              ))
            : null}
        </Select>
      </FormControl>
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
