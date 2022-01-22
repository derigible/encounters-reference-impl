import React from 'react'
import { Link } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { Typography } from '@mui/material'

function Tickets({token}) {
  if (!token) {
    return ( 
      <div>
        <Typography variant="h1">Need to Set Navigator Token</Typography>
      </div>     
    )
  } 
  return (
    <div>
      <h1>Tickets</h1>
      <br></br>
      <p>Display Ticketing Info Here</p>
      <br></br>
      <NavLink to="./MuiGraph">
        <button>CLICK HERE FOR YOUR TICKETS</button>
      </NavLink>
      <br></br>
      <Link to="/tickets2">
        <button>OTHER NAVIGATOR'S TICKETS</button>
      </Link>
    </div>
  )
}

export default Tickets
