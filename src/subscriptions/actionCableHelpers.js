import { createConsumer } from '@rails/actioncable'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'

export const destroyActionCableLink = () => {
  try {
    actionCable.cable.disconnect()
  } catch (error) {
    // eslint-disable-next-line
    console.log('Failed destroy ActionCable', error)
  } finally {
    actionCable = null
  }
}

let actionCable = null

export const createActionCableLink = (token) => {
  if (actionCable) {
    destroyActionCableLink()
  }
  const actionCableUrl = 'ws://localhost:3000/cable' + getTypeAndId()
  const cable = createConsumer(actionCableUrl)

  actionCable = new ActionCableLink({
    cable,
    channelName: 'GraphqlChannel',
  })

  return actionCable
}

export const rebuildActionCabelLink = (token) => {
  actionCable.cable.disconnect()
  actionCable.cable.url = 'ws://localhost:3000'
  actionCable.cable.connect()
}

export function getTypeAndId() {
  const parts = window.location.pathname.split('/')
  return `?type=${parts[1]}&id=${parts[2]}`
}
