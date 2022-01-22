import { Button, Paper, TextField, Typography } from '@mui/material'
import React from 'react'

export default function User({ storeToken, token }) {
  const saveToken = (e) => {
    e.preventDefault()
    storeToken(e.target['access_token'].value)
  }
  

  return (
    <div>
      <h1>User Info</h1>
      <Paper style={{ padding: '3em', maxWidth: '30em' }}>
        {token ? <Typography>Token Stored</Typography> : null}
        <form onSubmit={saveToken} >
          <div style={{ marginBottom: '1em' }}>
            <TextField
              id="access_token"
              label="Access Token"
              variant="outlined"
              margin="normal"
            />
          </div>
          <Button variant="contained" type="submit" >
            Save Token
          </Button>
        </form>
      </Paper>
    </div>
  )
}
