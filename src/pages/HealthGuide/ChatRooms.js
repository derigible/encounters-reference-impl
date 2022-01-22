import { Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

function ChatRoom({ token }) {
  if (!token) {
    return ( 
      <div>
        <Typography variant="h1">Need to Set HealthGuide Token</Typography>
      </div>     
    )
  } 
  return (
    <div>
      <h1>ChatRoom Rooms</h1>
      <br></br>
      <p>Display ChatRoom Info Here</p>
      <br></br>
      <Link to="/chatRoomTab1">
        <button>PENDING CHATROOMROOM LINKS</button>
      </Link>
      <br></br>
      <br></br>
      <Link to="/chatRoomTab2">
        <button>REMAINING CHATROOMROOMS</button>
      </Link>
    </div>
  )
};

export default ChatRoom
