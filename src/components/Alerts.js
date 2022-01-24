import React from 'react'
import { useMessenger } from '@pinkairship/use-messenger'
import { Alert } from '@mui/material'

const alertsContainer = {
  position: 'fixed',
  width: '100%',
  top: 0,
}

const alertsContainerItem = {
  margin: 'auto',
  maxWidth: '50%',
}

export default function Alerts() {
  const { messages, removeMessage } = useMessenger()

  return (
    <div style={alertsContainer}>
      <div style={alertsContainerItem}>
        {Object.values(messages).map((m) => (
          <Alert
            key={m.id}
            onClose={() => removeMessage(m.id)}
            severity={m.status}
          >
            {m.message}
          </Alert>
        ))}
      </div>
    </div>
  )
}
