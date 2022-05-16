import {
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'
import { useQuery, useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { M_CHAT_ROOM_QUERY } from '../../gql/queries/m_chat_room'
import { M_CURRENT_USER_QUERY } from '../../gql/queries/m_current_user'
import { M_CHAT_ROOMS_QUERY } from '../../gql/queries/m_chat_rooms'
import { M_SEND_MESSAGE_MUTATION } from '../../gql/mutations/m_send_message_mutation'
import { M_UPDATE_LAST_READ_MESSAGE_MUTATION } from '../../gql/mutations/m_update_last_read_message_mutation'
import { MAKE_REQUEST_MUTATION } from '../../gql/mutations/make_request_mutation'
import { useState } from 'react'
import { compact } from '../../utils'

export default function Member() {
  const { addMessage } = useMessenger()
  const { data: c_data, loading: c_loading, error: c_error } = useQuery(
    M_CURRENT_USER_QUERY
  )
  const [makeRequest] = useMutation(MAKE_REQUEST_MUTATION, {
    update: (
      _currentCache,
      {
        data: {
          make_request: { member_request, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[MakeRequestErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[MakeRequest] ${m}`, 'error'))
        )
      } else {
        console.log('[MakeRequest] successful')
        addMessage(
          `Request made. You can reference it with id ${member_request.id}`
        )
      }
    },
  })
  const { data, loading, error } = useQuery(M_CHAT_ROOMS_QUERY)
  const [requestModal, setRequestModal] = useState(false)
  const toggleRequestModal = () => setRequestModal(!requestModal)

  if (loading || c_loading) return <div>Loading...</div>
  if (error || c_error)
    return <div>{`Error! ${error ? error.message : c_error.message}`}</div>

  const updateQuery = (prev, { subscriptionData }) => {
    console.log('updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.message_for_chat_rooms.message

    if (subscriptionData.data.message_for_chat_rooms.remove) {
      console.log(
        `[ChatRoomMessagesSub] removing the message ${newChatMessage.id}`
      )
      return {
        ...prev,
        chat_room: {
          ...prev.chat_room,
          messages: prev.chat_room.messages.filter(
            (m) => m.id !== newChatMessage.id
          ),
        },
      }
    } else if (subscriptionData.data.message_for_chat_rooms.replace) {
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
      return {
        ...prev,
        chat_room: {
          ...prev.chat_room,
          messages: [...prev.chat_room.messages, newChatMessage],
        },
      }
    }
  }
  const update = (chatRoomId) => (
    currentCache,
    {
      data: {
        send_message: { message, errors },
      },
    }
  ) => {
    const messagesQueryParams = {
      query: M_CHAT_ROOM_QUERY,
      variables: { chatRoomId: chatRoomId },
    }

    if (errors && errors.length > 0) {
      console.log(`[SendMessageErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) => addMessage(`[SendMessage] ${m}`, 'error'))
      )
    } else {
      console.log('updating through the mutation')
      const chat_room = currentCache.readQuery(messagesQueryParams)
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chat_room: {
            ...chat_room.chat_room,
            messages: [...chat_room.chat_room.messages, message],
          },
        },
      })
    }
  }
  const updateFromUpdateReadMut = (chatRoomId) => (
    currentCache,
    {
      data: {
        update_last_read_message: { chat_room, errors },
      },
    }
  ) => {
    const messagesQueryParams = {
      query: M_CHAT_ROOM_QUERY,
      variables: { chatRoomId: chatRoomId },
    }

    if (errors && errors.length > 0) {
      console.log(`[UpdateLastReadErrors]`, errors)
      errors.forEach((e) =>
        e.messages.forEach((m) => addMessage(`[UpdateLastRead] ${m}`, 'error'))
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

  const handleSubmit = (e) => {
    e.preventDefault()

    const variables = compact({
      ticketTypeId: e.target['ticketTypeId'].value,
      content: JSON.stringify({
        title: e.target['title'].value,
      }),
    })
    makeRequest({
      variables,
    })
    toggleRequestModal()
  }

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member - {c_data.currentUser.name}
      </Typography>
      <Button variant="contained" color="primary" onClick={toggleRequestModal}>
        Create Request
      </Button>
      <Grid container spacing={2}>
        {data.chat_rooms.map((c) => {
          const lastReadMessageIdNode = c.participants.nodes.find(
            (p) =>
              p.sender.id == c_data.currentUser.employee_id &&
              p.sender.__typename == 'SharedMemberType'
          )
          return (
            <Grid item xs={6} md={6} key={c.id}>
              <ChatRoom
                chatRoomId={c.id}
                chatRoomQuery={M_CHAT_ROOM_QUERY}
                sendMessageMutation={M_SEND_MESSAGE_MUTATION}
                updateReadMutation={M_UPDATE_LAST_READ_MESSAGE_MUTATION}
                updateFromUpdateReadMut={updateFromUpdateReadMut}
                updateQuery={updateQuery}
                update={update(c.id)}
                currentUserId={c_data.currentUser.employee_id}
                currentLastMessageForUser={
                  lastReadMessageIdNode.last_read_message_id
                }
                isOwner={(u) =>
                  u.sender &&
                  u.sender.id === c.owner.id &&
                  u.sender.__typename === 'SharedMemberType'
                }
                participants={c.participants.nodes}
              />
            </Grid>
          )
        })}
      </Grid>
      <Dialog open={requestModal} onClose={toggleRequestModal} maxWidth="xl">
        <DialogTitle>Make a Request</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField id="title" name="title" label="Title" required />
            <TextField
              id="ticketTypeId"
              name="ticketTypeId"
              label="Ticket Type Id"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleRequestModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
