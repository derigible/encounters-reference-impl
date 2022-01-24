import './App.css'
import { Route, Routes } from 'react-router-dom'
import './App.css'

import HealthGuide from './pages/HealthGuide'
import Member from './pages/Member'
import { Button } from '@mui/material'

function App() {
  const resetUser = () => {
    window.location.href = '/'
  }
  return (
    <>
      <Button variant="contained" onClick={resetUser} >
        Reset User
      </Button>
      <div style={{ marginTop: '1em' }}>
        <Routes>
          <Route path="/health_guide/*" element={<HealthGuide />} />
          <Route path="/member" element={<Member />} />
        </Routes>
      </div>
    </>
  )
}

export default App
