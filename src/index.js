import { useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Button, Paper, TextField, Typography } from '@mui/material'

import App from './App.js'
import client from './subscriptions/client'

function StartScreen() {
  const [apolloClient, setApolloClient] = useState()

  if(apolloClient) {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    )
  }

  const saveChoices = (e) => {
    e.preventDefault()
    setApolloClient(client({
      token: e.target['access_token'].value,
      path: e.target['actor-type'].value
    }))
  }

  return (
    <div>
      <h1>Enter Type Information</h1>
      <Paper style={{ padding: '3em', maxWidth: '30em' }}>
        <form onSubmit={saveChoices} >
          <div style={{ marginBottom: '1em' }}>
            <TextField
              id="access_token"
              label="Access Token"
              variant="outlined"
              margin="normal"
              required
            />
          </div>
          <div style={{ marginBottom: '1em' }}>
          <FormControl>
            <FormLabel id="demo-radio-buttons-group-label">Member or Health Guide</FormLabel>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="graphql"
              name="actor-type"
            >
              <FormControlLabel value="graphql" control={<Radio />} label="Health Guide" />
              <FormControlLabel value="consumer" control={<Radio />} label="Member" />
            </RadioGroup>
          </FormControl>
          </div>
          <Button variant="contained" type="submit" >
            Save Token
          </Button>
        </form>
      </Paper>
    </div>
  )
}

ReactDOM.render(
  <StartScreen />,
  document.getElementById('root')
)
