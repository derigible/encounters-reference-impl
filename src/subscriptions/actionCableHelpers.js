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

export const createActionCableLink = (token, channelName) => {
  if (actionCable) {
    destroyActionCableLink()
  }
  const actionCableUrl = 'wss://wss-staging.rightwayhealthcare.com/?auth_token=' + token
  const cable = createConsumer(actionCableUrl)

  actionCable = new ActionCableLink({
    cable,
    channelName,
  })

  return actionCable
}

