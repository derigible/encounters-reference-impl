import { Paper, Typography, Box, Stack, TextField, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { CHAT_ROOM_MESSAGES_SUBSCRIPTION } from '../gql/subscriptions/chat_room_messages_subscription'

const messageStyles = {
  backgroundColor: 'green',
  display: 'inline-block',
  padding: '0.5em',
  borderRadius: '10px',
  color: 'white',
  maxWidth: '30em',
}
const ownerStyles = { backgroundColor: 'orange', color: 'initial' }
const ownerStylesBlock = { justifyContent: 'end', display: 'inherit' }
const ownerRight = { justifyContent: 'end', display: 'flex' }

export default function ChatRoom({
  chatRoomId,
  chatRoomQuery,
  sendMessageMutation,
  updateQuery,
  update,
  setActiveMessagesCount = () => {},
}) {
  const variables = { chatRoomId }
  const [newMessage, setNewMessage] = useState('')
  const { subscribeToMore, data, loading, error } = useQuery(chatRoomQuery, {
    variables,
  })

  useEffect(() => {
    return subscribeToMore({
      document: CHAT_ROOM_MESSAGES_SUBSCRIPTION,
      variables,
      updateQuery,
    })
  }, [])
  useEffect(() => {
    if (loading || error) return
    setActiveMessagesCount(
      (data['chatRoom'] || data['chat_room']).messages.length
    )
  }, [loading, error])

  const [sendMessage] = useMutation(sendMessageMutation, { update })

  const submitMessage = () => {
    sendMessage({
      variables: {
        chatRoomId: chatRoomId,
        content: newMessage,
      },
    })
    setNewMessage('')
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  const chatRoom = data['chatRoom'] || data['chat_room']
  // TODO: fix this for health guide - must compare by id - pass this function in
  const isOwner = (u) => u.sender && u.sender.id === chatRoom.owner.id
  const messages = chatRoom.messages
  return (
    <Paper>
      <Typography variant="h3">{chatRoom.category}</Typography>
      <Box
        sx={{
          backgroundColor: 'primary.dark',
          '&:hover': {
            backgroundColor: 'primary.main',
          },
          padding: '1em',
        }}
      >
        <Stack>
          {messages
            .slice()
            .sort((m1, m2) => parseInt(m1.id) - parseInt(m2.id))
            .map((m) => (
              <div key={m.id} style={isOwner(m) ? ownerStylesBlock : {}}>
                <Stack>
                  <div style={isOwner(m) ? ownerRight : {}}>
                    <Typography color="white">
                      {m.sender ? m.sender.name : 'Name'} - {m.sent_at}
                    </Typography>
                  </div>
                  <div style={isOwner(m) ? ownerRight : {}}>
                    <span
                      style={
                        isOwner(m)
                          ? { ...messageStyles, ...ownerStyles }
                          : messageStyles
                      }
                    >
                      <Typography>{m.content}</Typography>
                    </span>
                  </div>
                </Stack>
              </div>
            ))}
        </Stack>
      </Box>
      <div style={{ padding: '0.5em' }}>
        <Stack direction="row">
          <TextField
            label="Message"
            multiline
            maxRows={4}
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            variant="contained"
            style={{ marginLeft: '0.25em' }}
            onClick={submitMessage}
          >
            Send
          </Button>
        </Stack>
      </div>
    </Paper>
  )
}
