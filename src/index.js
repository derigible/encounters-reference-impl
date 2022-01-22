import { useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import ReactDOM from 'react-dom'
import { BrowserRouter, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Button, Paper, TextField } from '@mui/material'

import App from './App.js'
import client from './subscriptions/client'

function StartScreen() {
  const [searchParams] = useSearchParams()
  const loc = useLocation()
  console.log(loc)

  const [apolloClient, setApolloClient] = useState(() =>{
    if(searchParams.get('access_token')) {
      return client({
        token: searchParams.get('access_token'),
        path: loc.pathname
      })
    }
  })
  const navigate = useNavigate()
  

  if(apolloClient) {
    return (
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    )
  }

  const saveChoices = (e) => {
    e.preventDefault()
    const actorType = e.target['actor-type'].value
    const token = e.target['access_token'].value
    setApolloClient(client({
      token ,
      path: actorType
    }))
    let path = actorType === 'graphql' ? '/health_guide' : '/member'
    const params = new URLSearchParams({...searchParams, access_token: token})
    path += `?${params.toString()}`
    
    navigate(path)
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

  <BrowserRouter>
    <StartScreen />
  </BrowserRouter>,
  document.getElementById('root')
)
