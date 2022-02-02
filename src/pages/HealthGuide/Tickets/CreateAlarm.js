import { useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import { useState } from 'react'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { CREATE_ALARM_MUTATION } from '../../../gql/mutations/create_alarm_mutation'
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'

export default function CreateAlarm({
  ticketId,
  close,
  availableHealthGuides,
  filters,
}) {
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
          variables: { filters },
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
