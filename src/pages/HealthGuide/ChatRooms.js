import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, gql } from '@apollo/client'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Button } from '@mui/material'
import { useMessenger } from '@pinkairship/use-messenger'

import { SUBSCRIBE_TO_CHATROOM_MUTATION } from '../../gql/mutations/subscribe_to_chat_mutation'
import { UNSUBSCRIBE_FROM_CHATROOM_MUTATION } from '../../gql/mutations/unsubscribe_from_chat_mutation'
import { HG_CHAT_ROOMS_QUERY } from '../../gql/queries/hg_chat_rooms'
import { UNSUBSCRIBED_CHAT_ROOM_MESSAGES } from '../../gql/subscriptions/unsubscribed_chat_room_messages_subscription'

function ChatRooms({ setActiveChatRoom, currentHealthGuideId }) {
  const { subscribeToMore, data, loading, error } = useQuery(
    HG_CHAT_ROOMS_QUERY
  )

  useEffect(() => {
    return subscribeToMore({
      document: UNSUBSCRIBED_CHAT_ROOM_MESSAGES,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const newChatMessage =
          subscriptionData.data.unsubscribed_chat_room_messages.message
        return {
          ...prev,
          chatRoom: {
            ...prev.chatRoom,
            messages: [...prev.chatRoom.messages, newChatMessage],
          },
        }
      },
    })
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Category</TableCell>
            <TableCell align="right">Member</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.chat_rooms.map((row) => {
            const isParticipating = Object.values(row.participants.nodes).some(
              (n) =>
                n.id === currentHealthGuideId && n.__typename === 'HealthGuide'
            )
            return (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.category}
                </TableCell>
                <TableCell align="right">{row.owner.name}</TableCell>
                <TableCell align="right">
                  {isParticipating ? (
                    <>
                      <UnsubscribeFromChatButton
                        chatRoomId={row.id}
                        healthGuideId={currentHealthGuideId}
                      />
                      <Button
                        variant="contained"
                        onClick={() => setActiveChatRoom(row.id)}
                      >
                        Join Chat
                      </Button>
                    </>
                  ) : (
                    <SubscribeToChatButton
                      chatRoomId={row.id}
                      healthGuideId={currentHealthGuideId}
                    />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ChatRooms

function SubscribeToChatButton({ chatRoomId, healthGuideId }) {
  const { addMessage } = useMessenger()
  const [subscribeToChat] = useMutation(SUBSCRIBE_TO_CHATROOM_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          subscribeToChat: { chat_room, errors },
        },
      }
    ) => {
      const messagesQueryParams = {
        query: gql`
          query ChatRoom($chatRoomId: ID!) {
            chat_room(chat_room_id: $chatRoomId) {
              id
              category
              owner {
                id
                name
              }
            }
          }
        `,
        variables: { chatRoomId },
      }
      if (errors.length > 0) {
        console.log(`[SubscribeToChat]`, errors)
        errors.messages.forEach((m) =>
          addMessage(`[SubscribeToChat] ${m}`, 'error')
        )
      } else {
        console.log('updating through the mutation')
        const chatRoom = currentCache.readQuery(messagesQueryParams)
        currentCache.writeQuery({
          ...messagesQueryParams,
          data: {
            chat_room: {
              ...chatRoom,
              ...chat_room,
            },
          },
        })
      }
    },
  })
  return (
    <Button
      variant="contained"
      onClick={() =>
        subscribeToChat({
          variables: {
            chatRoomId,
            healthGuideId,
          },
        })
      }
    >
      Subscribe to Chat
    </Button>
  )
}

function UnsubscribeFromChatButton({ chatRoomId, healthGuideId }) {
  const { addMessage } = useMessenger()
  const [unsubscribeFromChat] = useMutation(
    UNSUBSCRIBE_FROM_CHATROOM_MUTATION,
    {
      update: (
        currentCache,
        {
          data: {
            unsubscribeFromChat: { chat_room, errors },
          },
        }
      ) => {
        const messagesQueryParams = {
          query: gql`
            query ChatRoom($chatRoomId: ID!) {
              chat_room(chat_room_id: $chatRoomId) {
                id
                category
                owner {
                  id
                  name
                }
              }
            }
          `,
          variables: { chatRoomId },
        }

        if (errors.length > 0) {
          console.log(`[UnsubscribeFromChat]`, errors)
          errors.messages.forEach((m) =>
            addMessage(`[UnsubscribeFromChat] ${m}`, 'error')
          )
        } else {
          console.log('updating through the mutation')
          const chatRoom = currentCache.readQuery(messagesQueryParams)
          currentCache.writeQuery({
            ...messagesQueryParams,
            data: {
              chat_room: {
                ...chatRoom,
                ...chat_room,
              },
            },
          })
        }
      },
    }
  )
  return (
    <Button
      variant="outlined"
      onClick={() =>
        unsubscribeFromChat({
          variables: {
            chatRoomId,
            healthGuideId,
          },
        })
      }
      style={{ marginRight: '0.25em' }}
    >
      Unsubscribe from Chat
    </Button>
  )
}
