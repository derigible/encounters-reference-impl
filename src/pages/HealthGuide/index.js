import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'

import ChatRooms from './ChatRooms'
import Tickets from '../../components/Tickets'

const TAB_MAP = {
  1: 'chatRooms',
  2: 'tickets',
  3: 'userInfo',
}

const REVERSE_TAB_MAP = {
  chatRooms: '1',
  tickets: '2',
  userInfo: '3',
}

export default function HealthGuide() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [value, setValue] = useState(REVERSE_TAB_MAP[(searchParams.get('tab') || 'chatRooms')])
  const [token, storeToken] = useState()

  const handleChange = (event, newValue) => {
    setValue(newValue)
    setSearchParams({ ...searchParams, tab: TAB_MAP[newValue] })
  }

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        HealthGuide
      </Typography>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="ChatRooms" value="1" />
              <Tab label="Tickets" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <ChatRooms storeToken={storeToken} token={token} id={null}/>
          </TabPanel>
          <TabPanel value="2">
            <Tickets />
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
