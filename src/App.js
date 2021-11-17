import './App.css'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
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
              <Typography
                variant="h6"
                component={Link}
                to="/member"
                margin="0 1em 0 0"
              >
                Member
              </Typography>
              <Typography variant="h6" component={Link} to="/navigator">
                Navigator
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
        <div style={{ marginTop: '5em' }}>
          <Routes>
            <Route path="/navigator" element={<Navigator />} />
            <Route path="/member" element={<Member />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  )
}

export default App
