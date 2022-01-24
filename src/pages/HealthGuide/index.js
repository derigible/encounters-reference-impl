import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Typography } from '@mui/material'
import { Route, Routes, useSearchParams } from 'react-router-dom'

import { useQuery } from '@apollo/client'

import ChatRooms from './ChatRooms'
import Tickets from './Tickets'
import HealthGuideChat from './HealthGuideChat'
import {CURRENT_USER_QUERY} from '../../gql/queries/current_user'

const TAB_MAP = {
  1: 'chatRooms',
  2: 'tickets'
}

const REVERSE_TAB_MAP = {
  chatRooms: '1',
  tickets: '2'
}

export default function HealthGuideStart() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY)

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>
  return (
    <Routes>
      <Route path="/chatRoom/:id" element={<HealthGuideChat currentUserId={data.current_user.id} />} />
      <Route path="/" element={<HealthGuide currentUserId={data.current_user.id} />} />
    </Routes>
  )
}


function HealthGuide({currentUserId}) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [value, setValue] = useState(REVERSE_TAB_MAP[(searchParams.get('tab') || 'chatRooms')])

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
            <ChatRooms currentUserId={currentUserId}/>
          </TabPanel>
          <TabPanel value="2">
            <Tickets currentUserId={currentUserId}/>
          </TabPanel>
        </TabContext>
      </Box>
    </>
  )
}
