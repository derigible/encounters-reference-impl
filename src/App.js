import './App.css'
import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppBar, Typography, Box, Toolbar } from '@mui/material'

import Navigator from './pages/Navigator'
import Member from './pages/Member'

function App() {
  return (
    <>
      <div style={{ marginTop: '5em' }}>
        <Routes>
          <Route path="/navigator" element={<Navigator />} />
          <Route path="/member" element={<Member />} />
        </Routes>
      </div>
    </>
  )
}

export default App
