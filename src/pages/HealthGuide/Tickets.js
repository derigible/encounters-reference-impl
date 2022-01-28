import { useQuery } from '@apollo/client'
import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

import { TICKETS_QUERY } from '../../gql/queries/tickets'

export default function Tickets({ token }) {
  const [filters, setFilters] = useState({})
  const { data, loading, error } = useQuery(TICKETS_QUERY, {
    variables: {
      filters,
    },
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Id</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Assignee</TableCell>
            <TableCell>Claimed</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Member</TableCell>
            <TableCell>Parent Ticket Id</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Alarms</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell align="right">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.encounter_tickets
            .slice()
            .sort((r1, r2) => {
              if (r1.created_at < r2.created_at) {
                return -1
              }
              if (r1.created_at > r2.created_at) {
                return 1
              }
              return 0
            })
            .map((row) => {
              return (
                <TableRow
                  key={row.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.id}
                  </TableCell>
                  <TableCell>{row.ticket_type.display_name}</TableCell>
                  <TableCell>{row.state.toUpperCase()}</TableCell>
                  <TableCell>
                    {row.assignees.length
                      ? row.assignees[0].name
                      : 'Not assigned'}
                  </TableCell>
                  <TableCell>{row.claimed ? 'Claimed' : ''}</TableCell>
                  <TableCell>{row.created_by.name}</TableCell>
                  <TableCell>{row.member.name}</TableCell>
                  <TableCell>
                    {row.parent_ticket ? row.parent_ticket.id : null}
                  </TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>{row.alarms.length}</TableCell>
                  <TableCell>{row.created_at}</TableCell>
                  <TableCell>{row.updated_at}</TableCell>
                  <TableCell>''</TableCell>
                </TableRow>
              )
            })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
