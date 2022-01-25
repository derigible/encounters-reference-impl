import { Typography, Grid } from '@mui/material'
import { useQuery } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { M_CHAT_ROOM_QUERY } from '../../gql/queries/m_chat_room'
import { M_CURRENT_USER_QUERY } from '../../gql/queries/m_current_user'
import { M_CHAT_ROOMS_QUERY } from '../../gql/queries/m_chat_rooms'
import { M_SEND_MESSAGE_MUTATION } from '../../gql/mutations/m_send_message_mutation'
import { M_UPDATE_LAST_READ_MESSAGE_MUTATION } from '../../gql/mutations/m_update_last_read_message_mutation'

export default function Member() {
  const { addMessage } = useMessenger()
  const { data: c_data, loading: c_loading, error: c_error } = useQuery(
    M_CURRENT_USER_QUERY
  )
  const { data, loading, error } = useQuery(M_CHAT_ROOMS_QUERY)

  if (loading || c_loading) return <div>Loading...</div>
  if (error || c_error)
    return <div>{`Error! ${error ? error.message : c_error.message}`}</div>

  const updateQuery = (prev, { subscriptionData }) => {
    console.log('updating through ws')
    if (!subscriptionData.data) return prev
    const newChatMessage = subscriptionData.data.chat_room_messages.message
    return {
      ...prev,
      chat_room: {
        ...prev.chat_room,
        messages: [...prev.chat_room.messages, newChatMessage],
      },
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

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member - {c_data.currentUser.name}
      </Typography>
      <Grid container spacing={2}>
        {data.chat_rooms.map((c) => {
          const lastReadMessageIdNode = c.participants.nodes.find(
            (p) =>
              p.sender.id == c_data.currentUser.employee_id &&
              p.sender.__typename == 'SharedMemberType'
          )
          console.log(lastReadMessageIdNode)
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
              />
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
