import { useMutation } from '@apollo/client'
import { useMessenger } from '@pinkairship/use-messenger'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Paper from '@mui/material/Paper'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { UPDATE_TICKET_MUTATION } from '../../../gql/mutations/update_ticket_mutation'
import { Button, TextField, Stack } from '@mui/material'
import { compact } from '../../../utils'

export default function UpdateTicket({ close, filters, ticketId, ticket }) {
  const { addMessage } = useMessenger()
  const [updateTicket] = useMutation(UPDATE_TICKET_MUTATION, {
    update: (
      currentCache,
      {
        data: {
          updateTicket: { ticket: updatedTicket, errors },
        },
      }
    ) => {
      if (errors.length > 0) {
        console.log(`[UpdateTicketErrors]`, errors)
        errors.forEach((e) =>
          e.messages.forEach((m) => addMessage(`[UpdateTicket] ${m}`, 'error'))
        )
      } else {
        console.log('[UpdateTicket] updating through the mutation')
        const ticketQueryParams = {
          query: TICKETS_QUERY,
          variables: { filters },
        }
        const tickets = currentCache
          .readQuery(ticketQueryParams)
          .encounter_tickets.slice()
        const ticketIndex = tickets.findIndex((t) => t.id === updatedTicket.id)
        tickets.splice(ticketIndex, 1, updatedTicket)

        currentCache.writeQuery({
          ...ticketQueryParams,
          data: {
            encounter_tickets: tickets,
          },
        })
      }
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    const variables = {
      ticketId,
      updates: compact({
        ticketTypeId: e.target['ticketTypeId'].value,
        sourceId: e.target['sourceId'].value,
        sourceType: e.target['sourceType'].value,
        notes: e.target['notes'].value,
      }),
    }
    updateTicket({
      variables,
    })
    close()
  }
  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Update Ticket</DialogTitle>
      <DialogContent>
        <Paper sx={{ padding: 2 }}>
          <Stack spacing={2}>
            <TextField
              id="notes"
              name="notes"
              label="Notes"
              defaultValue={ticket.notes || ''}
            />
            <TextField
              id="ticketTypeId"
              name="ticketTypeId"
              label="Ticket Type Id"
              defaultValue={ticket.ticket_type_id}
            />
            <TextField
              id="sourceId"
              name="sourceId"
              label="Source Id"
              defaultValue={ticket.source_id || ''}
            />
            <TextField
              id="sourceType"
              name="sourceType"
              label="Source Type Id"
              defaultValue={ticket.source_type || ''}
            />
          </Stack>
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button type="submit" variant="contained">
          Update
        </Button>
      </DialogActions>
    </form>
  )
}
