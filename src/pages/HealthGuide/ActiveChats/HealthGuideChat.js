import { useState } from 'react'
import { useMessenger } from '@pinkairship/use-messenger'
import { useMutation, useQuery } from '@apollo/client'

import ChatRoom from '../../../components/ChatRoom'
import { CHAT_ROOM_QUERY } from '../../../gql/queries/chat_room'
import { AVAILABLE_HEALTH_GUIDES_QUERY } from '../../../gql/queries/available_health_guides_query'
import { SEND_MESSAGE_MUTATION } from '../../../gql/mutations/send_message_mutation'
import { UPDATE_LAST_READ_MESSAGE_MUTATION } from '../../../gql/mutations/update_last_read_message_mutation'
import { FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material'
import SubscribeToChatButton from '../SubscribeToChatButton'
import { DELETE_MESSAGE_MUTATION } from '../../../gql/mutations/delete_message_mutation'
import { EDIT_MESSAGE_MUTATION } from '../../../gql/mutations/edit_message_mutation'

export default function HealthGuideChat({
  currentUser,
  currentHealthGuideId,
  chatRoom,
  setActiveMessagesCount,
  incrementMessagesCount,
  decrementMessagesCount,
  closeChat,
}) {
  const { addMessage } = useMessenger()
  const [selectedHealthGuide, setSelectedHealthGuide] = useState('')
  const { data, loading, error } = useQuery(AVAILABLE_HEALTH_GUIDES_QUERY, {
    variables: { chatRoomId: chatRoom.id },
    onCompleted: (completedData) =>
      setSelectedHealthGuide(
        completedData.available_health_guides.length > 0
          ? completedData.available_health_guides[0].id
          : ''
      ),
  })
  const [deleteMessageMutation] = useMutation(DELETE_MESSAGE_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          deleteMessage: { message, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[DeleteMessageErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[DeleteMessage] ${m}`, 'error'))
        )
      } else {
        console.log('[DeleteMessage] updating through the mutation')
        const messagesQueryParams = {
          query: CHAT_ROOM_QUERY,
          variables: { chatRoomId: chatRoom.id },
        }
        const cRoom = currentCache.readQuery(messagesQueryParams)
        const messages = cRoom.chat_room.messages.filter(
          (m) => m.id !== message.id
        )
        currentCache.writeQuery({
          ...messagesQueryParams,
          data: {
            chat_room: {
              ...cRoom.chat_room,
              messages,
            },
          },
        })
        decrementMessagesCount()
      }
    },
  })
  const [editMessageMutation] = useMutation(EDIT_MESSAGE_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          editMessage: { message, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[EditMessageErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[EditMessage] ${m}`, 'error'))
        )
      } else {
        console.log('[EditMessage] updating through the mutation')
        const messagesQueryParams = {
          query: CHAT_ROOM_QUERY,
          variables: { chatRoomId: chatRoom.id },
        }
        const cRoom = currentCache.readQuery(messagesQueryParams)
        const messageIndex = cRoom.chat_room.messages.findIndex(
          (m) => m.id === message.id
        )
        const messages = cRoom.chat_room.messages.slice()
        messages.splice(messageIndex, 1, message)
        currentCache.writeQuery({
          ...messagesQueryParams,
          data: {
            chat_room: {
              ...cRoom.chat_room,
              messages,
            },
          },
        })
      }
    },
  })

  // new message over ws comes in, handle it
  const updateQuery = (prev, { subscriptionData }) => {
    console.log('updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.chat_room_messages.message

    if (subscriptionData.data.chat_room_messages.remove) {
      console.log(
        `[ChatRoomMessagesSub] removing the message ${newChatMessage.id}`
      )
      decrementMessagesCount()
      return {
        ...prev,
        chat_room: {
          ...prev.chat_room,
          messages: prev.chat_room.messages.filter(
            (m) => m.id !== newChatMessage.id
          ),
        },
      }
    } else if (subscriptionData.data.chat_room_messages.replace) {
      console.log(
        `[ChatRoomMessagesSub] replacing the message ${newChatMessage.id}`
      )
      const oldMessageIndex = prev.chat_room.messages.findIndex(
        (m) => m.id === newChatMessage.id
      )
      const newMessages = prev.chat_room.messages.slice()
      newMessages.splice(oldMessageIndex, 1, newChatMessage)
      return {
        ...prev,
        chat_room: {
          ...prev.chat_room,
          messages: newMessages,
        },
      }
    } else {
      console.log(
        `[ChatRoomMessagesSub] adding the message ${newChatMessage.id}`
      )
      incrementMessagesCount()
      return {
        ...prev,
        chat_room: {
          ...prev.chat_room,
          messages: [...prev.chat_room.messages, newChatMessage],
        },
      }
    }
  }
  // sent message return value handler
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
      // Update the last read message of the sender for the frontend to reflect that
      // they read the message they sent
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...cRoom.chat_room,
            participants: {
              nodes: [
                ...cRoom.chat_room.participants.nodes.filter(
                  (p) => p.sender.id === message.sender.id
                ),
                {
                  ...cRoom.chat_room.participants.nodes.find(
                    (p) => p.sender.id === message.sender.id
                  ),

                  last_read_message_id: message.id,
                },
              ],
            },
            messages,
          },
        },
      })
      incrementMessagesCount()
    }
  }
  // sent message read event return value handler
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

  const deleteMessage = (messageId) => {
    deleteMessageMutation({
      variables: {
        messageId,
      },
    })
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
      <Stack direction="row" spacing={1}>
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
        <SubscribeToChatButton
          healthGuideId={selectedHealthGuide}
          chatRoomId={chatRoom.id}
        />
      </Stack>
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
        deleteMessage={deleteMessage}
        editMessage={editMessageMutation}
      />
    </div>
  )
}
