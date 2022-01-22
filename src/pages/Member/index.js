import { Typography, Grid } from '@mui/material'
import { useQuery } from '@apollo/client'

import ChatRoom from '../../components/ChatRoom'
import {M_CHAT_ROOM_QUERY} from '../../gql/queries/m_chat_room'
import {M_CHAT_ROOMS_QUERY} from '../../gql/queries/m_chat_rooms'
import {M_SEND_MESSAGE_MUTATION} from '../../gql/mutations/m_send_message_mutation'

export default function Member() {
  const { data, loading, error } = useQuery(M_CHAT_ROOMS_QUERY)

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>
  
  const updateQuery = (prev, { subscriptionData }) => {
      console.log('updating through ws')
      if (!subscriptionData.data) return prev
      const newChatMessage = subscriptionData.data.chatRoomMessages.message
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
        sendMessage: { message, errors },
      },
    }
  ) => {
    const messagesQueryParams = {
      query: M_CHAT_ROOM_QUERY,
      variables: { chat_room_id: chatRoomId },
    }

    console.log('updating through the mutation')
    const chat = currentCache.readQuery(messagesQueryParams)
    currentCache.writeQuery({
      ...messagesQueryParams,
      data: {
        chat: { ...chat.chat, messages: [...chat.chat.messages, message] },
      },
    })
    if (errors) {
      console.log(`[ChatMutationErrors]`, errors)
    }
  }
  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member
      </Typography>
      <Grid container spacing={2}>
        {
          data.chat_rooms.map((c) => (
            <Grid item xs={6} md={6} key={c.category_id}>
              <ChatRoom 
                chatRoom={c} 
                chatRoomQuery={M_CHAT_ROOM_QUERY} 
                sendMessageMutation={M_SEND_MESSAGE_MUTATION}
                updateQuery={updateQuery}
                update={update(c.id)}
              />
            </Grid>
          ))
        }
      </Grid>
    </>
  )
}
