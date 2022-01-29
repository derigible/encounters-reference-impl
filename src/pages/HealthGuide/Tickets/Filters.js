import { Button, TextField, Stack, Typography } from '@mui/material'

export default function Filters({ filters, handleSubmit, encounter_tickets }) {
  return (
    <form onSubmit={handleSubmit}>
      <Stack direction="row" spacing={1} marginBottom={1}>
        <Typography>Ticket Count: {encounter_tickets.length}</Typography>
        <TextField
          id="health_guide_id"
          name="health_guide_id"
          label="Health Guide Id"
          defaultValue={filters.health_guide_id}
        />
        <TextField
          id="state"
          name="state"
          label="State"
          defaultValue={filters.state}
        />
        <TextField
          id="tpa_id"
          name="tpa_id"
          label="TPA Id"
          defaultValue={filters.tpa_id}
        />
        <TextField
          id="organization_id"
          name="organization_id"
          label="Org Id"
          defaultValue={filters.org_id}
        />
        <TextField
          id="member_id"
          name="member_id"
          label="Member Id"
          defaultValue={filters.member_id}
        />
        <TextField
          id="ticket_type_id"
          name="ticket_type_id"
          label="Ticket Type Id"
          defaultValue={filters.ticket_type_id}
        />
        <Button type="submit" variant="outlined">
          Filter
        </Button>
      </Stack>
    </form>
  )
}
