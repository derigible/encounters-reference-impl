import { gql, useMutation, useQuery } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import { useState } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'

import { TICKETS_QUERY } from '../../gql/queries/tickets'
import { CREATE_ALARM_MUTATION } from '../../gql/mutations/create_alarm_mutation'
import { AVAILABLE_HEALTH_GUIDES_QUERY } from '../../gql/queries/available_health_guides_query'
import {
  Button,
  IconButton,
  Link,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'
import { TICKET_FRAGMENT } from '../../gql/fragments/ticket_fragment'
import { DELETE_ALARM_MUTATION } from '../../gql/mutations/delete_alarm_mutation'

export default function Tickets({ token }) {
  const [filters, setFilters] = useState({})
  const [modalType, setModalType] = useState(false)
  const [ticketIdForAlarms, setTicketIdForAlarms] = useState('')
  const { data, loading, error } = useQuery(TICKETS_QUERY, {
    variables: {
      filters,
    },
  })
  const { data: a_data, loading: a_loading, error: a_error } = useQuery(
    AVAILABLE_HEALTH_GUIDES_QUERY
  )

  if (loading || a_loading) return <div>Loading...</div>
  if (error || a_error)
    return <div>{`Error! ${(a_error || error).message}`}</div>

  const manageAlarms = (ticketId) => {
    setTicketIdForAlarms(ticketId)
    setModalType('manage')
  }
  const createAlarm = (ticketId) => {
    setTicketIdForAlarms(ticketId)
    setModalType('create')
  }
  const alarms = (
    data.encounter_tickets.find((t) => t.id === ticketIdForAlarms) || {
      alarms: [],
    }
  ).alarms
  return (
    <>
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
                    <TableCell>
                      {row.alarms.length ? (
                        <Link
                          onClick={() => manageAlarms(row.id)}
                          component="button"
                        >
                          {row.alarms.length}
                        </Link>
                      ) : null}
                    </TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>{row.updated_at}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        onClick={() => createAlarm(row.id)}
                      >
                        Create Alarm
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        open={!!modalType}
        onClose={() => setModalType(null)}
        maxWidth="xl"
      >
        {modalType === 'manage' ? (
          <ManageAlarmsDialog
            alarms={alarms}
            ticketId={ticketIdForAlarms}
            close={() => setModalType(null)}
          />
        ) : (
          <CreateAlarm
            ticketId={ticketIdForAlarms}
            close={() => setModalType(null)}
            availableHealthGuides={a_data.available_health_guides}
          />
        )}
      </Dialog>
    </>
  )
}

function ManageAlarmsDialog({ alarms, ticketId, close }) {
  const { addMessage } = useMessenger()
  const [removeAlarm] = useMutation(DELETE_ALARM_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          deleteAlarm: { alarm, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[DeleteAlarmErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[DeleteAlarm] ${m}`, 'error'))
        )
      } else {
        console.log('[DeleteAlarm] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters: {} },
        }
        const tickets = currentCache.readQuery(ticketQueryParams)
          .encounter_tickets
        const ticket = tickets.find((t) => t.id === ticketId)
        const newAlarms = ticket.alarms.filter((a) => a.id !== alarm.id)
        const encounter_tickets = tickets.slice()
        encounter_tickets[
          encounter_tickets.findIndex((t) => t.id === ticketId)
        ] = {
          ...ticket,
          alarms: newAlarms,
        }
        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets,
          },
        })
      }
    },
  })
  return (
    <>
      <DialogTitle>Manage Alarms</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Alert At</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell>For</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alarms.map((row) => {
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
                    <TableCell>{row.alert_at}</TableCell>
                    <TableCell>{row.notes}</TableCell>
                    <TableCell>{row.for.name}</TableCell>
                    <TableCell>{row.created_by.name}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        aria-label="remove alarm"
                        onClick={() =>
                          removeAlarm({ variables: { alarmId: row.id } })
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
      </DialogContent>
      <DialogActions>
        <Button onClick={close} variant="contained">
          Done
        </Button>
      </DialogActions>
    </>
  )
}

function CreateAlarm({ ticketId, close, availableHealthGuides }) {
  const { addMessage } = useMessenger()
  const [alertAt, setAlertAt] = useState(
    new Date(Date.now()).toISOString().split('.')[0]
  )
  const [createAlarm] = useMutation(CREATE_ALARM_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          createAlarm: { alarm, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[CreateAlarmErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[CreateAlarm] ${m}`, 'error'))
        )
      } else {
        console.log('[CreateAlarm] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters: {} },
        }
        const tickets = currentCache.readQuery(ticketQueryParams)
          .encounter_tickets
        const ticket = tickets.find((t) => t.id === ticketId)
        const alarms = [...ticket.alarms, alarm]
        const encounter_tickets = tickets.slice()
        encounter_tickets[
          encounter_tickets.findIndex((t) => t.id === ticketId)
        ] = {
          ...ticket,
          alarms,
        }
        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets,
          },
        })
      }
    },
  })
  const [selectedHealthGuide, setSelectedHealthGuide] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    createAlarm({
      variables: {
        ticketId,
        alarmData: {
          for: selectedHealthGuide,
          notes: e.target['notes'].value,
          alert_at: e.target['alert_at'].value,
        },
      },
    })
    close()
  }
  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Create Alarm</DialogTitle>
      <DialogContent>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={2}>
            <TextField id="notes" name="notes" label="Notes" required />
            <label style={{ display: 'block' }} htmlFor="alert_at">
              Alert at
            </label>
            <input
              value={alertAt}
              type="datetime-local"
              name="alert_at"
              id="alert_at"
              required
              onChange={(e) => setAlertAt(e.target.value)}
            />
            <FormControl required>
              <InputLabel id="availableHealthGuides">Assign</InputLabel>
              <Select
                labelId="availableHealthGuides"
                id="availableHealthGuidesSelect"
                value={selectedHealthGuide}
                label="Assign"
                onChange={(e) => {
                  setSelectedHealthGuide(e.target.value)
                }}
              >
                {availableHealthGuides.map((hg) => (
                  <MenuItem value={hg.id} key={hg.id}>
                    {hg.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="contained">
          Create
        </Button>
      </DialogActions>
    </form>
  )
}
