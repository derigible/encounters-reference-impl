import React from 'react'
import { Link } from 'react-router-dom'
import DataTable from '../components/MuiGraph'
import { NavLink } from 'react-router-dom'

function Tickets(props) {
  return (
    <div>
      <h1>Tickets</h1>
      <br></br>
      <p>Display Ticketing Info Here</p>
      <br></br>
      <NavLink to="./MuiGraph" component={DataTable}>
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
