import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'

import Chats from './Chats'

export default function Member() {
  const [value, setValue] = useState('1')
  const [searchParams, setSearchParams] = useSearchParams()

  const handleChange = (event, newValue) => {
    setValue(newValue)
    setSearchParams({ ...searchParams })
  }

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        Member
      </Typography>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab label="Chats" value="1" />
              <Tab label="User Info" value="2" />
            </TabList>
          </Box>
          <TabPanel value="1">
            <Chats />
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
