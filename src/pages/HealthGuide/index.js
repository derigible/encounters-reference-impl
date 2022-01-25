import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Badge, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { ChatBubbleOutline, NotificationsNone } from '@mui/icons-material'

import { useQuery } from '@apollo/client'

import ChatRooms from './ChatRooms'
import Tickets from './Tickets'
import HealthGuideChat from './HealthGuideChat'
import Notifications from './Notifications'
import { CURRENT_USER_QUERY } from '../../gql/queries/current_user'

export default function HealthGuide() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY)

  const [searchParams, setSearchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('tab') || 'chatRooms')
  const [chatRoomId, setChatRoomId] = useState(
    searchParams.get('active_chat_id')
  )
  const [activeMessagesCount, setActiveMessagesCount] = useState(0)
  const [newUnreadMessage, setNewUnreadMessage] = useState(false)
  const [activeNotificationsCount, setActiveNotificationsCount] = useState(0)
  const [newUnreadNotification, setNewUnreadNotification] = useState(false)

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  const currentHealthGuideId = data.current_user.health_guide.id
  const currentUserId = data.current_user.id

  const handleChange = (event, newValue) => {
    setValue(newValue)
    searchParams.set('tab', newValue)
    setSearchParams(searchParams)
    if (newValue === 'active_chat') {
      setNewUnreadMessage(false)
    }
  }
  const setActiveChat = (chatId) => {
    setChatRoomId(chatId)
    searchParams.set('active_chat_id', chatId)
    setSearchParams(searchParams)
  }
  const notifyNewMessage = () => {
    console.log(value)
    if (searchParams.get('tab') !== 'active_chat') {
      setNewUnreadMessage(true)
    }
  }
  const notifyNewNotification = () => {
    console.log(value)
    if (searchParams.get('tab') !== 'notifications') {
      setNewUnreadNotification(true)
    }
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
              <Tab label="ChatRooms" value="chatRooms" />
              <Tab label="Tickets" value="tickets" />
              <Tab
                label="Active Chat"
                iconPosition="start"
                icon={
                  <Badge
                    badgeContent={activeMessagesCount}
                    color={newUnreadMessage ? 'warning' : 'primary'}
                  >
                    <ChatBubbleOutline />
                  </Badge>
                }
                value="active_chat"
              />
              <Tab
                label="Notifications"
                iconPosition="start"
                icon={
                  <Badge
                    badgeContent={activeNotificationsCount}
                    color={newUnreadNotification ? 'warning' : 'primary'}
                  >
                    <NotificationsNone />
                  </Badge>
                }
                value="notifications"
              />
            </TabList>
          </Box>
          <TabPanel value="chatRooms">
            <ChatRooms
              currentUserId={currentUserId}
              currentHealthGuideId={currentHealthGuideId}
              setActiveChatRoom={setActiveChat}
            />
          </TabPanel>
          <TabPanel value="tickets">
            <Tickets
              currentUserId={data.currentUserId}
              currentHealthGuideId={data.currentHealthGuideId}
            />
          </TabPanel>
        </TabContext>
        <div
          style={{
            display: value === 'active_chat' ? 'block' : 'none',
            padding: '24px',
          }}
        >
          <HealthGuideChat
            currentUserId={currentUserId}
            currentHealthGuideId={currentHealthGuideId}
            chatRoomId={chatRoomId}
            notifyNewMessage={notifyNewMessage}
            setActiveMessagesCount={setActiveMessagesCount}
          />
        </div>
        <div
          style={{
            display: value === 'notifications' ? 'block' : 'none',
            padding: '24px',
          }}
        >
          <Notifications
            currentUserId={currentUserId}
            currentHealthGuideId={currentHealthGuideId}
            notifyNewNotification={notifyNewNotification}
            setActiveNotificationsCount={setActiveNotificationsCount}
          />
        </div>
      </Box>
    </>
  )
}
