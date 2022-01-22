import { Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'

function Chat({ token }) {
  if (!token) {
    return ( 
      <div>
        <Typography variant="h1">Need to Set HealthGuide Token</Typography>
      </div>     
    )
  } 
  return (
    <div>
      <h1>Chat Rooms</h1>
      <br></br>
      <p>Display Chat Info Here</p>
      <br></br>
      <Link to="/chatTab1">
        <button>PENDING CHATROOM LINKS</button>
      </Link>
      <br></br>
      <br></br>
      <Link to="/chatTab2">
        <button>REMAINING CHATROOMS</button>
      </Link>
    </div>
  )
};

export default Chat
