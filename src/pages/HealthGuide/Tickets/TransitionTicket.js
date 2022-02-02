import { useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { TRANSITION_TICKET_MUTATION } from '../../../gql/mutations/transition_ticket'
import { useState } from 'react'

export default function ManageAssignees({
  availableTransitions,
  ticketId,
  close,
  filters,
  currentState,
}) {
  const { addMessage } = useMessenger()
  const [selectedTransition, setTransition] = useState('')
  const [transitionMutation] = useMutation(TRANSITION_TICKET_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          transitionTicket: { ticket, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[TransitionTicketErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) =>
            addMessage(`[TransitionTicket] ${m}`, 'error')
          )
        )
      } else {
        console.log('[TransitionTicket] updating through the mutation')
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

  const transition = () => {
    transitionMutation({
      variables: {
        ticketId,
        transition: selectedTransition,
      },
    })
  }
  return (
    <>
      <DialogTitle>Transition Ticket</DialogTitle>
      <DialogContent>
        <Typography>State: {currentState}</Typography>
        <div style={{ marginTop: '0.75em' }}>
          <Stack direction="row" margin="normal" spacing={1} minWidth="20em">
            <FormControl fullWidth>
              <InputLabel id="availableHealthGuides">
                Select Transition
              </InputLabel>
              <Select
                labelId="availableHealthGuides"
                id="transitionSelect"
                value={selectedTransition}
                label="Select Transition"
                onChange={(e) => {
                  setTransition(e.target.value)
                }}
              >
                {availableTransitions.map((t) => (
                  <MenuItem value={t} key={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={transition}>
              Transition
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
