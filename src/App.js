import './App.css'
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'
import './App.css'
import { AppBar, Typography, Box, Toolbar } from '@mui/material'

import Navigator from './pages/Navigator'
import Member from './pages/Member'

function App() {
  return (
    <>
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="fixed">
            <Toolbar>
              <Typography variant="h6" component="div" margin="0 1em 0 0">
                <Link to="/member">Member</Link>
              </Typography>
              <Typography variant="h6" component="div">
                <Link to="/navigator">Navigator</Link>
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <div style={{ marginTop: '5em' }}>
          <Switch>
            <Route path="/navigator" component={Navigator} />
            <Route path="/member" component={Member} />
          </Switch>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
