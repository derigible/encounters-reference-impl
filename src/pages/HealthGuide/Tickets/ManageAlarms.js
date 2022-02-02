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
import { Button, IconButton } from '@mui/material'
import { DeleteOutline } from '@mui/icons-material'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { DELETE_ALARM_MUTATION } from '../../../gql/mutations/delete_alarm_mutation'

export default function ManageAlarms({ alarms, ticketId, close, filters }) {
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
          variables: { filters },
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
