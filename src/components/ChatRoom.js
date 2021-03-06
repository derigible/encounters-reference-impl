import {
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@apollo/client'

import { CHAT_ROOM_MESSAGES_SUBSCRIPTION } from '../gql/subscriptions/chat_room_messages_subscription'
import { CHAT_ROOM_CHANGES_SUBSCRIPTION } from '../gql/subscriptions/chat_room_changes_subscription'
import { M_CHAT_ROOM_MESSAGES_SUBSCRIPTION } from '../gql/subscriptions/m_chat_room_messages_subscription'
import { DeleteSharp, EditSharp } from '@mui/icons-material'

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
  participants,
  deleteMessage,
  editMessage,
}) {
  const variables = { chatRoomId }
  const [newMessage, setNewMessage] = useState('')
  const [editModal, setEditModal] = useState(null)
  const { subscribeToMore, data, loading, error } = useQuery(chatRoomQuery, {
    variables,
  })
  const toggleEditModal = (id = null) => setEditModal(id)

  useEffect(() => {
    return subscribeToMore({
      document: deleteMessage
        ? CHAT_ROOM_MESSAGES_SUBSCRIPTION
        : M_CHAT_ROOM_MESSAGES_SUBSCRIPTION,
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
          <Typography variant="h3">
            {chatRoom.category} - {chatRoom.id}
          </Typography>
        </div>
        {closeChat ? (
          <Button variant="outlined" onClick={() => closeChat(chatRoomId)}>
            Close
          </Button>
        ) : null}
      </Stack>

      <Box
        sx={{
          backgroundColor: '#d3d2d2',
          '&:hover': {
            backgroundColor: '#c1c1c1',
          },
          padding: '1em',
        }}
      >
        <Stack>
          {messages
            .slice()
            .sort((m1, m2) => parseInt(m1.id) - parseInt(m2.id))
            .map((m, index) => {
              lastMessage = m.id
              return (
                <React.Fragment key={m.id}>
                  <div style={isOwner(m) ? ownerStylesBlock : {}}>
                    <Stack>
                      <div style={isOwner(m) ? ownerRight : {}}>
                        <Typography color="white">
                          {m.sender
                            ? `${m.sender.name} - ${m.sender.id}`
                            : 'Name'}{' '}
                          - {m.sent_at}
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
                              <MessageContent content={m.content} />
                            </Typography>
                          </span>
                        </Box>
                        {isOwner(m) && editMessage ? (
                          <IconButton onClick={() => toggleEditModal(m.id)}>
                            <EditSharp />
                          </IconButton>
                        ) : null}
                        {isOwner(m) && deleteMessage ? (
                          <IconButton onClick={() => deleteMessage(m.id)}>
                            <DeleteSharp />
                          </IconButton>
                        ) : null}
                      </div>
                    </Stack>
                  </div>
                  <ReadMessageToHere
                    messageId={m.id}
                    participants={participants}
                    isLastMessage={messages.length - 1 === index}
                    isFirstMessage={index === 0}
                  />
                </React.Fragment>
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
              if (!lastMessage || lastMessage === currentLastMessageForUser)
                return
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
      <Dialog open={!!editModal} onClose={toggleEditModal} maxWidth="xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            editMessage({
              variables: {
                messageId: editModal,
                content: e.target['editedMessage'].value,
              },
            })
            e.target.value = ''
            toggleEditModal()
          }}
        >
          <DialogTitle>Edit Message</DialogTitle>
          <DialogContent>
            <TextField
              label="Message"
              multiline
              maxRows={4}
              name="editedMessage"
              fullWidth
              defaultValue={
                editModal
                  ? messages.find((m) => m.id === editModal).content
                  : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={toggleEditModal}>Cancel</Button>
            <Button type="submit" variant="contained">
              Edit
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  )
}

function ReadMessageToHere({
  messageId,
  participants,
  isLastMessage,
  isFirstMessage,
}) {
  if (isLastMessage) return null
  const readers = participants.filter(
    (p) =>
      p.last_read_message_id == messageId ||
      (isFirstMessage && p.last_read_message_id == null)
  )
  if (readers.length === 0) return null

  return (
    <div
      style={{
        background: 'transparent',
        padding: '20px 0',
        pointerEvents: 'none',
        userSelect: 'text',
      }}
    >
      <div
        style={{
          pointerEvents: 'none',
          display: 'flex',
          height: '0',
          marginTop: '-1px',
        }}
      >
        <hr
          style={{
            opacity: '.5',
            transition: 'opacity .1s 3s',
            marginRight: '0',
            backgroundImage:
              'linear-gradient(90deg,rgb(41 157 227) 0,rgb(41 157 227))',
            borderTop: '0',
            margin: '0 0 -1px',
            height: '1px',
            backgroundSize: '10px 1px',
            backgroundRepeat: 'repeat-x',
            flex: '1',
            position: 'relative',
            zIndex: '1',
            border: 'none',
            clear: 'both',
            padding: '0',
            display: 'block',
            unicodeBidi: 'isolate',
            marginBlockStart: '0.5em',
            marginBlockEnd: '0.5em',
            marginInlineStart: 'auto',
            marginInlineEnd: 'auto',
            overflow: 'hidden',
          }}
        />
        <Typography
          style={{
            color: 'rgb(41 157 227)',
            cursor: 'default',
            lineHeight: '1.50001',
            fontWeight: '700',
            height: '19px',
            fontSize: '13px',
            margin: '-0.15em 15px 0 0',
            padding: '0 4px',
            position: 'relative',
            zIndex: '1',
          }}
        >
          {readers.map((r) => r.sender.name).join(' | ')}
        </Typography>
      </div>
    </div>
  )
}

function MessageContent({ content }) {
  if (content.__typename === 'UnstructuredContent') {
    return content.text
  } else if (content.__typename === 'MemberRequestAppointment') {
    return content.title
  }
}
