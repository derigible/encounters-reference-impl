import { useQuery } from '@apollo/client'
import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import { useSearchParams } from 'react-router-dom'

import { TICKETS_QUERY } from '../../../gql/queries/tickets'
import { AVAILABLE_HEALTH_GUIDES_QUERY } from '../../../gql/queries/available_health_guides_query'

import CreateAlarm from './CreateAlarm'
import ManageAlarms from './ManageAlarms'
import Filters from './Filters'
import ManageAssignees from './ManageAssignees'
import TicketsTable from './TicketsTable'
import TransitionTicket from './TransitionTicket'
import CreateTicket from './CreateTicket'
import UpdateTicket from './UpdateTicket'

function compact(filters) {
  const newFilters = {}
  Object.entries(filters).forEach((e) => {
    const [k, v] = e
    if (v !== null && typeof v !== 'undefined' && v !== '') newFilters[k] = v
  })
  return newFilters
}

export default function Tickets({ token }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    health_guide_id: searchParams.get('health_guide_id'),
    state: searchParams.get('state'),
    tpa_id: searchParams.get('tpa_id'),
    organization_id: searchParams.get('organization_id'),
    member_id: searchParams.get('member_id'),
    ticket_type_id: searchParams.get('ticket_type_id'),
  })
  const [modalType, setModalType] = useState(false)
  const [workingTicketId, setWorkingTicketId] = useState('')
  const { data, loading, error } = useQuery(TICKETS_QUERY, {
    variables: {
      filters: compact(filters),
    },
  })
  const { data: a_data, loading: a_loading, error: a_error } = useQuery(
    AVAILABLE_HEALTH_GUIDES_QUERY
  )

  if (loading || a_loading) return <div>Loading...</div>
  if (error || a_error)
    return <div>{`Error! ${(a_error || error).message}`}</div>

  const manageAlarms = (ticketId) => {
    setWorkingTicketId(ticketId)
    setModalType('manage')
  }
  const manageAssignees = (ticketId) => {
    setWorkingTicketId(ticketId)
    setModalType('assignees')
  }
  const createAlarm = (ticketId) => {
    setWorkingTicketId(ticketId)
    setModalType('create')
  }
  const transitionState = (ticketId) => {
    setWorkingTicketId(ticketId)
    setModalType('transition')
  }
  const updateTicket = (ticketId) => {
    setWorkingTicketId(ticketId)
    setModalType('updateTicket')
  }
  const createTicket = () => {
    setModalType('createTicket')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newFilters = {
      health_guide_id: e.target['health_guide_id'].value,
      state: e.target['state'].value,
      tpa_id: e.target['tpa_id'].value,
      organization_id: e.target['organization_id'].value,
      member_id: e.target['member_id'].value,
      ticket_type_id: e.target['ticket_type_id'].value,
    }
    setFilters(newFilters)
    Object.keys(newFilters).forEach((k) => {
      if (newFilters[k]) {
        searchParams.set(k, newFilters[k])
      } else {
        searchParams.delete(k)
      }
    })
    setSearchParams(searchParams)
  }
  return (
    <>
      <Filters
        filters={filters}
        handleSubmit={handleSubmit}
        encounter_tickets={data.encounter_tickets}
        createTicket={createTicket}
      />
      <TicketsTable
        encounter_tickets={data.encounter_tickets}
        manageAlarms={manageAlarms}
        createAlarm={createAlarm}
        manageAssignees={manageAssignees}
        transitionState={transitionState}
        updateTicket={updateTicket}
      />
      <Dialog
        open={!!modalType}
        onClose={() => setModalType(null)}
        maxWidth="xl"
      >
        <DialogContent
          encounter_tickets={data.encounter_tickets}
          modalType={modalType}
          ticketId={workingTicketId}
          close={() => setModalType(null)}
          availableHealthGuides={a_data.available_health_guides}
          filters={compact(filters)}
        />
      </Dialog>
    </>
  )
}

function DialogContent({
  modalType,
  ticketId,
  close,
  availableHealthGuides,
  encounter_tickets,
  filters,
}) {
  const ticket = encounter_tickets.find((t) => t.id === ticketId)
  if (modalType === 'manage') {
    return (
      <ManageAlarms
        alarms={ticket.alarms}
        ticketId={ticketId}
        close={close}
        filters={filters}
      />
    )
  } else if (modalType === 'create') {
    return (
      <CreateAlarm
        ticketId={ticketId}
        close={close}
        availableHealthGuides={availableHealthGuides}
        filters={filters}
      />
    )
  } else if (modalType === 'assignees') {
    return (
      <ManageAssignees
        ticketId={ticketId}
        close={close}
        assignees={ticket.assignees}
        availableHealthGuides={availableHealthGuides}
        filters={filters}
      />
    )
  } else if (modalType === 'transition') {
    return (
      <TransitionTicket
        ticketId={ticketId}
        close={close}
        availableTransitions={ticket.valid_transitions}
        filters={filters}
        currentState={ticket.state}
      />
    )
  } else if (modalType === 'createTicket') {
    return (
      <CreateTicket
        close={close}
        filters={filters}
        availableHealthGuides={availableHealthGuides}
      />
    )
  } else if (modalType === 'updateTicket') {
    return (
      <UpdateTicket
        close={close}
        filters={filters}
        ticketId={ticketId}
        ticket={ticket}
      />
    )
  } else {
    return null
  }
}
