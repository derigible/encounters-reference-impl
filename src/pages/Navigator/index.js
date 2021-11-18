import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'

import Chats from './Chats'
import Tickets from '../../components/Tickets'
import UserInfo from '../../components/UserInfo'

const navigator = require('/Users/dylanfeldman/Desktop/rightway/test-tools-/src/data/navigator.js')

const TAB_MAP = {
  1: 'chats',
  2: 'tickets',
  3: 'userInfo',
}

const REVERSE_TAB_MAP = {
  chats: '1',
  tickets: '2',
  userInfo: '3',
}

export default function Navigator() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [value, setValue] = useState(REVERSE_TAB_MAP[searchParams.get('tab')])
  const [token, storeToken] = useState()

  const handleChange = (event, newValue) => {
    setValue(newValue)
    setSearchParams({ tab: TAB_MAP[newValue] })
  }

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Navigator
      </Typography>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Chats" value="1" />
              <Tab label="Tickets" value="2" />
              <Tab label="User Info" value="3" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Chats storeToken={storeToken} token={token} id={navigator.id}/>
          </TabPanel>
          <TabPanel value="2">
            <Tickets />
          </TabPanel>
          <TabPanel value="3">
            <UserInfo storeToken={storeToken} token={token} />
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
