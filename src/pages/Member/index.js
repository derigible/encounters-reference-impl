import { Typography, Grid } from '@mui/material'
import { useQuery } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'

import ChatRoom from '../../components/ChatRoom'
import { M_CHAT_ROOM_QUERY } from '../../gql/queries/m_chat_room'
import { M_CURRENT_USER_QUERY } from '../../gql/queries/m_current_user'
import { M_CHAT_ROOMS_QUERY } from '../../gql/queries/m_chat_rooms'
import { M_SEND_MESSAGE_MUTATION } from '../../gql/mutations/m_send_message_mutation'

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
  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member
      </Typography>
      <Grid container spacing={2}>
        {data.chat_rooms.map((c) => (
          <Grid item xs={6} md={6} key={c.id}>
            <ChatRoom
              chatRoomId={c.id}
              chatRoomQuery={M_CHAT_ROOM_QUERY}
              sendMessageMutation={M_SEND_MESSAGE_MUTATION}
              updateQuery={updateQuery}
              update={update(c.id)}
              currentUserId={c_data.currentUser.employee_id}
            />
          </Grid>
        ))}
      </Grid>
    </>
  )
}
