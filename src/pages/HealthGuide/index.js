import { useState } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Badge, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import {
  ChatBubbleOutline,
  NotificationsNone,
  Inbox,
} from '@mui/icons-material'

import { useQuery } from '@apollo/client'

import ChatRooms from './ChatRooms'
import Tickets from './Tickets'
import ActiveChats from './ActiveChats'
import Notifications from './Notifications'
import { CURRENT_USER_QUERY } from '../../gql/queries/current_user'
import { HG_CHAT_ROOMS_QUERY } from '../../gql/queries/hg_chat_rooms'

export default function HealthGuide() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY)
  const {
    subscribeToMore,
    data: chatRoomsData,
    loading: c_loading,
    error: c_error,
  } = useQuery(HG_CHAT_ROOMS_QUERY)

  const [searchParams, setSearchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('tab') || 'chatRooms')
  const [chatTab, setChatTab] = useState(searchParams.get('active_chat'))
  const [chatRoomIds, setChatRoomIds] = useState(
    searchParams.get('chats') ? searchParams.get('chats').split('.') : []
  )
  const [activeMessagesCount, setActiveMessagesCount] = useState(0)
  const [newUnreadMessage, setNewUnreadMessage] = useState(false)
  const [activeNotificationsCount, setActiveNotificationsCount] = useState(0)
  const [newUnreadNotification, setNewUnreadNotification] = useState(false)
  const [chatRoomsPendingIntake, setChatRoomsPendingIntake] = useState([])

  if (loading) return <div>Loading...</div>
  if (error) return <div>{`Error! ${error.message}`}</div>

  if (c_loading) return <div>Loading...</div>
  if (c_error) return <div>{`Error! ${c_error.message}`}</div>

  const currentHealthGuideId = data.current_user.health_guide.id
  const currentUserId = data.current_user.id

  const handleChange = (event, newValue) => {
    setValue(newValue)
    searchParams.set('tab', newValue)
    setSearchParams(searchParams)
    if (newValue === 'notifications') {
      setNewUnreadNotification(false)
    }
  }
  const handleChatChange = (event, newValue) => {
    setChatTab(newValue)
    searchParams.set('active_chat', newValue)
    setSearchParams(searchParams)
  }
  const addChatting = (chatRoomId) => {
    if (chatRoomIds.includes(chatRoomId)) return
    setChatRoomIds([...chatRoomIds, chatRoomId])
    searchParams.set('chats', [...chatRoomIds, chatRoomId].join('.'))
    setSearchParams(searchParams)
    setChatTab(chatRoomId)
  }
  const closeChat = (chatRoomId) => {
    if (!chatRoomIds.includes(chatRoomId)) return
    const newChatRoomIds = chatRoomIds.filter((id) => id !== chatRoomId)
    setChatRoomIds(newChatRoomIds)
    searchParams.set('chats', newChatRoomIds.join('.'))
    searchParams.set(
      'active_chat',
      newChatRoomIds.length > 0 ? newChatRoomIds[0] : ''
    )
    setChatTab(newChatRoomIds.length > 0 ? newChatRoomIds[0] : '')
    setSearchParams(searchParams)
  }
  const notifyNewNotification = () => {
    if (searchParams.get('tab') !== 'notifications') {
      setNewUnreadNotification(true)
    }
  }
  const notifyUnsubscribedMessageReceived = (chatRoomIdPending) => {
    setChatRoomsPendingIntake((prev) =>
      Array.from(new Set([...prev, chatRoomIdPending]))
    )
  }

  return (
    <>
      <Typography variant="h2" as="h1" gutterBottom>
        HealthGuide - {data.current_user.name}
      </Typography>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
              <Tab
                label="ChatRooms"
                value="chatRooms"
                iconPosition="start"
                icon={
                  <Badge
                    badgeContent={chatRoomsPendingIntake.length}
                    color="warning"
                  >
                    <Inbox />
                  </Badge>
                }
              />
              <Tab label="Tickets" value="tickets" />
              <Tab
                label="Chats"
                iconPosition="start"
                icon={
                  <Badge
                    badgeContent={activeMessagesCount}
                    color={newUnreadMessage ? 'warning' : 'primary'}
                    max={999}
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
          <TabPanel value="tickets">
            <Tickets
              currentUserId={data.currentUserId}
              currentHealthGuideId={data.currentHealthGuideId}
            />
          </TabPanel>
        </TabContext>
        <TabPanelSpacing tabName="chatRooms" currentTab={value}>
          <ChatRooms
            currentUserId={currentUserId}
            currentHealthGuideId={currentHealthGuideId}
            addChatting={addChatting}
            chatRooms={chatRoomsData.chat_rooms}
            subscribeToMore={subscribeToMore}
            notifyUnsubscribedMessageReceived={
              notifyUnsubscribedMessageReceived
            }
            chatRoomsPendingIntake={chatRoomsPendingIntake}
          />
        </TabPanelSpacing>
        <TabPanelSpacing tabName="active_chat" currentTab={value}>
          <ActiveChats
            value={value}
            chatRoomIds={chatRoomIds}
            chatTab={chatTab}
            data={data}
            currentHealthGuideId={currentHealthGuideId}
            chatRoomsData={chatRoomsData}
            setActiveMessagesCount={setActiveMessagesCount}
            closeChat={closeChat}
            handleChatChange={handleChatChange}
            newUnreadMessage={newUnreadMessage}
            setNewUnreadMessage={setNewUnreadMessage}
          />
        </TabPanelSpacing>
        <TabPanelSpacing tabName="notifications" currentTab={value}>
          <Notifications
            currentUserId={currentUserId}
            currentHealthGuideId={currentHealthGuideId}
            notifyNewNotification={notifyNewNotification}
            setActiveNotificationsCount={setActiveNotificationsCount}
          />
        </TabPanelSpacing>
      </Box>
    </>
  )
}

function TabPanelSpacing({ children, tabName, currentTab }) {
  return (
    <div
      style={{
        display: currentTab === tabName ? 'block' : 'none',
        padding: '24px',
      }}
    >
      {children}
    </div>
  )
}
