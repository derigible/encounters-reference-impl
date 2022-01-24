import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { Button } from '@mui/material'

import { SUBSCRIBE_TO_CHATROOM_MUTATION } from '../../gql/mutations/subscribe_to_chat_mutation'
import { UNSUBSCRIBE_FROM_CHATROOM_MUTATION } from '../../gql/mutations/unsubscribe_from_chat_mutation'
import { HG_CHAT_ROOMS_QUERY } from '../../gql/queries/hg_chat_rooms'
import { UNSUBSCRIBED_CHAT_ROOM_MESSAGES } from '../../gql/subscriptions/unsubscribed_chat_room_messages_subscription'
import { CHAT_ROOM_QUERY } from '../../gql/queries/chat_room'

function ChatRooms({ currentUserId, currentHealthGuideId }) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
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
              (n) => n.id == currentHealthGuideId
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
                        onClick={() =>
                          navigate(
                            `/health_guide/chatRoom/${row.id}?${searchParams}`
                          )
                        }
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
        query: CHAT_ROOM_QUERY,
        variables: { chatRoomId },
      }

      console.log('updating through the mutation')
      currentCache.writeQuery({
        ...messagesQueryParams,
        data: {
          chatRoom: chat_room,
        },
      })
      if (errors) {
        console.log(`[SubscribeToChat]`, errors)
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
          query: CHAT_ROOM_QUERY,
          variables: { chatRoomId },
        }

        console.log('updating through the mutation')
        currentCache.writeQuery({
          ...messagesQueryParams,
          data: {
            chatRoom: chat_room,
          },
        })
        if (errors) {
          console.log(`[UnsubscribeFromChat]`, errors)
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
