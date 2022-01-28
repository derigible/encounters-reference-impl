import React, { useEffect } from 'react'
import { useMutation, gql } from '@apollo/client'
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
import { UNSUBSCRIBED_CHAT_ROOM_MESSAGES } from '../../gql/subscriptions/unsubscribed_chat_room_messages_subscription'
import { PriorityHigh } from '@mui/icons-material'

function ChatRooms({
  chatRooms,
  addChatting,
  currentHealthGuideId,
  subscribeToMore,
  notifyUnsubscribedMessageReceived,
  pendingOnly = false,
  chatRoomsPendingIntake,
}) {
  useEffect(() => {
    return subscribeToMore({
      document: UNSUBSCRIBED_CHAT_ROOM_MESSAGES,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('[UnsubscribedChatRoomMessages] updating through ws')
        if (!subscriptionData.data) return prev
        const chatRoom =
          subscriptionData.data.unsubscribed_chat_room_messages.chatRoom
        notifyUnsubscribedMessageReceived(chatRoom.id)
        if (
          subscriptionData.data.unsubscribed_chat_room_messages.remove &&
          pendingOnly
        ) {
          return {
            ...prev,
            chat_rooms: prev.filter((c) => c.id !== chatRoom.id),
          }
        } else {
          return prev
        }
      },
    })
  }, [])

  const pendingIntakes = new Set(chatRoomsPendingIntake)
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
          {chatRooms
            .slice()
            .sort((r1, r2) => {
              const r1Intaking = pendingIntakes.has(r1.id)
              const r2Intaking = pendingIntakes.has(r2.id)
              if (r1Intaking) {
                return -1
              }
              if (!r1Intaking && r2Intaking) {
                return 1
              }
              return 0
            })
            .map((row) => {
              const isParticipating = Object.values(
                row.participants.nodes
              ).some(
                (n) =>
                  n.sender.id === currentHealthGuideId &&
                  n.sender.__typename === 'HealthGuide'
              )
              return (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {pendingIntakes.has(row.id) ? (
                      <PriorityHigh color="warning" />
                    ) : null}
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
                          onClick={() => addChatting(row.id)}
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
