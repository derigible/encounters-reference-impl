import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import {HG_CHAT_ROOMS_QUERY} from '../../gql/queries/hg_chat_rooms'
import {UNSUBSCRIBED_CHAT_ROOM_MESSAGES} from '../../gql/subscriptions/unsubscribed_chat_room_messages_subscription'
import { Button } from '@mui/material';

function ChatRooms({currentUserId}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { subscribeToMore, data, loading, error } = useQuery(HG_CHAT_ROOMS_QUERY)
  
  useEffect(() => {
    return subscribeToMore({
      document: UNSUBSCRIBED_CHAT_ROOM_MESSAGES,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const newChatMessage = subscriptionData.data.unsubscribed_chat_room_messages.message
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
  
  // TODO: make this the right mutation
  const subscribeToChat = () =>{}
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
            const isParticipating = Object.values(row.participants.nodes).some(n => n.id == currentUserId)
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
                  {
                    isParticipating 
                      ? (
                          <Button variant="contained" onClick={() => navigate(`/health_guide/chatRoom/${row.id}?${searchParams}`)}>
                            Join Chat
                          </Button>
                      )
                      : (
                          <Button variant="contained" onClick={() => subscribeToChat(row.id)}>
                            Subscribe to Chat
                          </Button>
                      )
                  }
                </TableCell>
              </TableRow>
            )})
          }
        </TableBody>
      </Table>
    </TableContainer>
  )
};

export default ChatRooms
