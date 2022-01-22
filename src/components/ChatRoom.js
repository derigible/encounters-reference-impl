
import { Paper, Typography, Box, Stack, TextField, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import {SEND_MESSAGE_MUTATION} from '../gql/mutations/send_message_mutation'
import {MESSAGES_QUERY} from '../gql/queries/messages_query'
import {CHAT_ROOM_MESSAGES_SUBSCRIPTION} from '../gql/subscriptions/chat_room_messages_subscription'

const messageStyles = {backgroundColor: 'green', display: 'inline-block', padding: '0.5em', borderRadius: '10px', color: 'white'}
const ownerStyles = {backgroundColor: 'orange', color: 'initial'}
const ownerStylesBlock = {justifyContent: 'end', display: 'inherit'}

export default function ChatRoom({ chatRoom }) {
  const variables = { chatRoomId: chatRoom.id }
  const [newMessage, setNewMessage] = useState('')
  const { subscribeToMore, data, loading, error } = useQuery(MESSAGES_QUERY, {
    variables,
  })

  useEffect(() => {
    return subscribeToMore({
      document: CHAT_ROOM_MESSAGES_SUBSCRIPTION,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const newChatMessage = subscriptionData.data.chatRoomMessages.message
        return {
          ...prev,
          chat: {
            ...prev.chat,
            messages: [...prev.chat.messages, newChatMessage],
          },
        }
      },
    })
  }, [])

  const [sendMessage] = useMutation(SEND_MESSAGE_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          sendMessage: { message, errors },
        },
      }
    ) => {
      const messagesQueryParams = {
        query: MESSAGES_QUERY,
        variables: { chat_room_id: chatRoom.id },
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
    },
  })

  const isOwner = (m) => m.sender.name === chatRoom.owner.name
  const submitMessage = () => {
    sendMessage({
      variables: {
        chatRoomId: chatRoom.id,
        content: newMessage
      }
    })
    setNewMessage('')
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  return (
    <Paper>
      <Typography variant="h3">{ChatRoom.category}</Typography>
      <Box sx={{
        backgroundColor: 'primary.dark',
        '&:hover': {
          backgroundColor: 'primary.main',
        },
        padding: '1em'
      }}>
        <Stack>
          {
            data.chat.messages.map((m) => (
              <div key={m.id} style={isOwner(m) ? ownerStylesBlock : {}}>
                <Stack>
                  <Typography color="white">{m.sender.name}</Typography>
                  <div>
                    <span style={isOwner(m) ? {...messageStyles, ...ownerStyles} : messageStyles}>
                      <Typography>{m.content}</Typography>
                    </span>
                  </div>
                </Stack>
              </div>
            ))
          }
        </Stack>
      </Box>
      <div style={{padding: '0.5em'}}>
        <Stack direction="row">
          <TextField
            label="Message"
            multiline
            maxRows={4}
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="contained" style={{marginLeft: '0.25em'}} onClick={submitMessage}>
            Send
          </Button>
        </Stack>
      </div>
    </Paper>
  )
}
