import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import { Badge, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { ChatBubbleOutline, NotificationsNone } from '@mui/icons-material'

import { useQuery, useApolloClient } from '@apollo/client'

import ChatRooms from './ChatRooms'
import Tickets from './Tickets'
import HealthGuideChat from './HealthGuideChat'
import Notifications from './Notifications'
import { CURRENT_USER_QUERY } from '../../gql/queries/current_user'
import { HG_CHAT_ROOMS_QUERY } from '../../gql/queries/hg_chat_rooms'
import { UNSUBSCRIBED_CHAT_ROOM_MESSAGES } from '../../gql/subscriptions/unsubscribed_chat_room_messages_subscription'
import { CHAT_ROOM_QUERY } from '../../gql/queries/chat_room'

export default function HealthGuide() {
  const { data, loading, error } = useQuery(CURRENT_USER_QUERY)
  const {
    subscribeToMore,
    data: chatRoomsData,
    loading: c_loading,
    error: c_error,
  } = useQuery(HG_CHAT_ROOMS_QUERY)
  const client = useApolloClient()

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

  useEffect(() => {
    return subscribeToMore({
      document: UNSUBSCRIBED_CHAT_ROOM_MESSAGES,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updating through ws')
        if (!subscriptionData.data) return prev
        const newChatMessage =
          subscriptionData.data.unsubscribed_chat_room_messages.message
        return {
          ...prev,
          chatRoom: {
            ...prev.chatRoom,
            messages: [...prev.chatRoom.messages, newChatMessage],
          },
        }
      },
    })
  }, [])

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
  let hasNewMessage = false

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
          <TabPanel value="chatRooms">
            <ChatRooms
              currentUserId={currentUserId}
              currentHealthGuideId={currentHealthGuideId}
              addChatting={addChatting}
              chatRooms={chatRoomsData.chat_rooms}
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
          <TabContext value={chatTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList
                onChange={handleChatChange}
                aria-label="lab API tabs example"
                variant="scrollable"
                scrollButtons="auto"
              >
                {chatRoomIds.map((id) => {
                  const chatRoom = chatRoomsData.chat_rooms.find(
                    (c) => c.id === id
                  )
                  const cachedChatRoom = client.readQuery({
                    query: CHAT_ROOM_QUERY,
                    variables: {
                      chatRoomId: id,
                    },
                  })
                  const memberName = chatRoom.owner.name
                  let hasNew = false
                  if (cachedChatRoom) {
                    hasNew =
                      cachedChatRoom.chat_room.messages
                        .slice()
                        .sort((m1, m2) => parseInt(m1.id) - parseInt(m2.id))[
                        cachedChatRoom.chat_room.messages.length - 1
                      ].id >
                      (chatRoom.participants.nodes.find(
                        (p) =>
                          p.sender.id === currentHealthGuideId &&
                          p.sender.__typename === 'HealthGuide'
                      ).last_read_message_id || -1)
                  }

                  hasNewMessage = hasNewMessage ? hasNewMessage : hasNew
                  if (cachedChatRoom && hasNewMessage !== newUnreadMessage) {
                    setNewUnreadMessage(hasNewMessage)
                  }
                  return (
                    <Tab
                      label={`${memberName} - ID${id}`}
                      value={id}
                      key={id}
                      iconPosition="start"
                      icon={
                        <Badge
                          badgeContent={
                            cachedChatRoom &&
                            cachedChatRoom.chat_room.messages.length
                          }
                          color={hasNew ? 'warning' : 'primary'}
                        >
                          <ChatBubbleOutline />
                        </Badge>
                      }
                    />
                  )
                })}
              </TabList>
            </Box>
          </TabContext>
          {chatRoomIds.map((id) => (
            <div
              style={{
                display: chatTab === id ? 'block' : 'none',
                padding: '24px',
              }}
              key={id}
            >
              <HealthGuideChat
                currentUserId={currentUserId}
                currentHealthGuideId={currentHealthGuideId}
                chatRoomId={id}
                incrementMessagesCount={() =>
                  setActiveMessagesCount((currentCount) => currentCount + 1)
                }
                setActiveMessagesCount={(count) =>
                  setActiveMessagesCount((currentCount) => currentCount + count)
                }
                closeChat={closeChat}
              />
            </div>
          ))}
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
