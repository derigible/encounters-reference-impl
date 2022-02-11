import { useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import { useState } from 'react'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { CREATE_TICKET_MUTATION } from '../../../gql/mutations/create_ticket_mutation'
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import { compact } from '../../../utils'

export default function CreateTicket({
  close,
  availableHealthGuides,
  filters,
}) {
  const { addMessage } = useMessenger()
  const [createTicket] = useMutation(CREATE_TICKET_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          createTicket: { ticket, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[CreateTicketErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[CreateTicket] ${m}`, 'error'))
        )
      } else {
        console.log('[CreateTicket] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters },
        }
        const tickets = currentCache.readQuery(ticketQueryParams)
          .encounter_tickets
        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets: [...tickets, ticket],
          },
        })
      }
    },
  })
  const [selectedHealthGuide, setSelectedHealthGuide] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    const variables = compact({
      assigneeId: selectedHealthGuide,
      memberId: e.target['memberId'].value,
      ticketTypeId: e.target['ticketTypeId'].value,
      sourceId: e.target['sourceId'].value,
      sourceType: e.target['sourceType'].value,
      notes: e.target['notes'].value,
      claim: e.target['ticketTypeId'].value.toLowerCase() === 'yes',
      memberRequestId: e.target['memberRequestId'].value,
    })
    createTicket({
      variables,
    })
    close()
  }
  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Create Ticket</DialogTitle>
      <DialogContent>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={2}>
            <TextField id="notes" name="notes" label="Notes" />
            <TextField
              id="memberId"
              name="memberId"
              label="Member Id"
              required
            />
            <TextField
              id="ticketTypeId"
              name="ticketTypeId"
              label="Ticket Type Id"
              required
            />
            <TextField
              id="memberRequestId"
              name="memberRequestId"
              label="Member Request Id"
            />
            <TextField id="sourceId" name="sourceId" label="Source Id" />
            <TextField
              id="sourceType"
              name="sourceType"
              label="Source Type Id"
            />
            <TextField id="claim" name="claim" label="Claim (type Yes)" />
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
