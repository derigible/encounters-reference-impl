
import { Paper, Typography, Box, Stack, TextField, Button } from '@mui/material'
import { useState } from 'react'

const messageStyles = {backgroundColor: 'green', display: 'inline-block', padding: '0.5em', borderRadius: '10px', color: 'white'}
const ownerStyles = {backgroundColor: 'orange', color: 'initial'}
const ownerStylesBlock = {justifyContent: 'end', display: 'inherit'}
export default function ChatRoom({category, owner}) {
  const [newMessage, setNewMessage] = useState('')
  const messages = [
    {
      id: 1,
      content: 'This is content',
      sender: {
        name: 'Marc'
      }
    },
    {
      id: 1,
      content: 'This is other content',
      sender: {
        name: 'Samuel'
      }
    }
  ]
  const isOwner = (m) => m.sender.name === owner.name
  const submitMessage = () => {
    setNewMessage('')
  }

  return (
    <Paper>
      <Typography variant="h3">{category}</Typography>
      <Box sx={{
        backgroundColor: 'primary.dark',
        '&:hover': {
          backgroundColor: 'primary.main',
        },
        padding: '1em'
      }}>
        <Stack>
          {
            messages.map((m) => (
              <div key={m.id} style={isOwner(m) ? ownerStylesBlock : {}}>
                <Stack>
                  <Typography color="white">{m.sender.name}</Typography>
                  <div>
                    <span style={isOwner(m) ? {...messageStyles, ...ownerStyles} : messageStyles}>
                      <Typography>{m.content}</Typography>
                    </span>
                  </div>
                </Stack>
              </div>
            ))
          }
        </Stack>
      </Box>
      <div style={{padding: '0.5em'}}>
        <Stack direction="row">
          <TextField
            label="Message"
            multiline
            maxRows={4}
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button variant="contained" style={{marginLeft: '0.25em'}} onClick={submitMessage}>
            Send
          </Button>
        </Stack>
      </div>
    </Paper>
  )
}
