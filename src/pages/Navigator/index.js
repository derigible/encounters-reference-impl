import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import Chats from './Chats'
import Tickets from '../../components/Tickets'
import UserInfo from '../../components/UserInfo'
import { Typography } from '@mui/material'

export default function Navigator() {
  const [value, setValue] = useState('1')
  const [token, storeToken] = useState()

  const handleChange = (event, newValue) => {
    setValue(newValue)
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
            <Chats />
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
