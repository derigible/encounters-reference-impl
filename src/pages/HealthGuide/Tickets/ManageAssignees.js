import { useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'
import {
  Button,
  IconButton,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { ASSIGN_TICKET_MUTATION } from '../../../gql/mutations/assign_ticket'
import { UNASSIGN_TICKET_MUTATION } from '../../../gql/mutations/unassign_ticket'
import { useState } from 'react'

export default function ManageAssignees({
  assignees,
  availableHealthGuides,
  ticketId,
  close,
  filters,
}) {
  const { addMessage } = useMessenger()
  const [selectedHealthGuide, setSelectedHealthGuide] = useState('')
  const [assignMutation] = useMutation(ASSIGN_TICKET_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          assignTicket: { ticket, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[AssignTicketErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[AssignTicket] ${m}`, 'error'))
        )
      } else {
        console.log('[AssignTicket] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters },
        }
        const tickets = currentCache.readQuery(ticketQueryParams)
          .encounter_tickets
        const encounter_tickets = tickets.slice()
        encounter_tickets[
          encounter_tickets.findIndex((t) => t.id === ticketId)
        ] = ticket
        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets,
          },
        })
      }
    },
  })
  const [removeAssignee] = useMutation(UNASSIGN_TICKET_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          unassignTicket: { ticket, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[UnassignTicketErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) =>
            addMessage(`[UnassignTicket] ${m}`, 'error')
          )
        )
      } else {
        console.log('[UnassignTicket] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters },
        }
        const tickets = currentCache.readQuery(ticketQueryParams)
          .encounter_tickets
        const encounter_tickets = tickets.slice()
        encounter_tickets[
          encounter_tickets.findIndex((t) => t.id === ticketId)
        ] = ticket
        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets,
          },
        })
      }
    },
  })
  const assigneeIds = new Set(assignees.map((a) => a.id))

  const assign = () => {
    assignMutation({
      variables: {
        ticketId,
        healthGuideIds: [selectedHealthGuide],
      },
    })
  }
  return (
    <>
      <DialogTitle>Manage Assignees</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Name</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assignees.map((row) => {
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                    }}
                  >
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        aria-label="remove assignee"
                        onClick={() =>
                          removeAssignee({
                            variables: { ticketId, healthGuideId: row.id },
                          })
                        }
                      >
                        <DeleteOutline />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div style={{ marginTop: '0.75em' }}>
          <Stack direction="row" margin="normal" spacing={1}>
            <FormControl fullWidth>
              <InputLabel id="availableHealthGuides">
                Available Health Guides
              </InputLabel>
              <Select
                labelId="availableHealthGuides"
                id="availableHealthGuidesSelect"
                value={selectedHealthGuide}
                label="Available Health Guides"
                onChange={(e) => {
                  setSelectedHealthGuide(e.target.value)
                }}
              >
                {availableHealthGuides
                  .filter((hg) => !assigneeIds.has(hg.id))
                  .map((hg) => (
                    <MenuItem value={hg.id} key={hg.id}>
                      {hg.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={assign}>
              Assign
            </Button>
          </Stack>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained">
          Done
        </Button>
      </DialogActions>
    </>
  )
}
