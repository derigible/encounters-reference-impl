import { Paper, Typography, Box, Stack, TextField, Button } from '@mui/material'
import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { CHAT_ROOM_MESSAGES_SUBSCRIPTION } from '../gql/subscriptions/chat_room_messages_subscription'
import { CHAT_ROOM_CHANGES_SUBSCRIPTION } from '../gql/subscriptions/chat_room_changes_subscription'

const messageStyles = {
  display: 'inline-block',
  padding: '0.5em',
}
const ownerStylesBlock = { justifyContent: 'end', display: 'inherit' }
const ownerRight = { justifyContent: 'end', display: 'flex' }

export default function ChatRoom({
  chatRoomId,
  chatRoomQuery,
  sendMessageMutation,
  updateReadMutation,
  updateQuery,
  update,
  updateFromUpdateReadMut,
  setActiveMessagesCount = () => {},
  closeChat,
  currentLastMessageForUser,
  isOwner,
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
    // HealthGuideSpecific Code
    if (closeChat) {
      return subscribeToMore({
        document: CHAT_ROOM_CHANGES_SUBSCRIPTION,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const newChatRoom = subscriptionData.data.chat_room_changes.chat_room
          return {
            ...prev,
            chat_room: {
              ...prev.chat_room,
              ...newChatRoom,
            },
          }
        },
      })
    }
  }, [])
  useEffect(() => {
    if (loading || error) return
    setActiveMessagesCount(
      (data['chatRoom'] || data['chat_room']).messages.length
    )
  }, [loading, error])

  const [sendMessage] = useMutation(sendMessageMutation, { update })
  const [updateRead] = useMutation(updateReadMutation, {
    update: updateFromUpdateReadMut,
  })

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
  const messages = chatRoom.messages
  let lastMessage
  return (
    <Paper>
      <Stack direction="row" justifyContent="space-between">
        <div>
          <Typography variant="h3">{chatRoom.category}</Typography>
        </div>
        {closeChat ? (
          <Button variant="outlined" onClick={() => closeChat(chatRoomId)}>
            Close
          </Button>
        ) : null}
      </Stack>

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
            .map((m) => {
              lastMessage = m.id
              return (
                <div key={m.id} style={isOwner(m) ? ownerStylesBlock : {}}>
                  <Stack>
                    <div style={isOwner(m) ? ownerRight : {}}>
                      <Typography color="white">
                        {m.sender ? m.sender.name : 'Name'} - {m.sent_at}
                      </Typography>
                    </div>
                    <div style={isOwner(m) ? ownerRight : {}}>
                      <Box
                        sx={{
                          backgroundColor: isOwner(m)
                            ? 'warning.main'
                            : 'secondary.main',
                          borderRadius: '10px',
                          maxWidth: '30em',
                        }}
                      >
                        <span style={messageStyles}>
                          <Typography
                            color={isOwner(m) ? '#fffcfa' : '#f5e8f7'}
                          >
                            {m.content}
                          </Typography>
                        </span>
                      </Box>
                    </div>
                  </Stack>
                </div>
              )
            })}
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
            onFocus={() => {
              if (lastMessage === currentLastMessageForUser) return
              console.log(lastMessage, currentLastMessageForUser)
              updateRead({
                variables: {
                  chatRoomId: chatRoomId,
                  messageId: lastMessage,
                },
              })
            }}
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
