import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import { Badge, Typography } from '@mui/material'
import { ChatBubbleOutline } from '@mui/icons-material'
import { useApolloClient } from '@apollo/client'

import { CHAT_ROOM_QUERY } from '../../../gql/queries/chat_room'

export default function ActiveChatsTabs({
  chatRoomIds,
  chatTab,
  handleChatChange,
  chatRoomsData,
  currentHealthGuideId,
  newUnreadMessage,
  setNewUnreadMessage,
}) {
  const client = useApolloClient()
  const hasNewMessage = []

  return (
    <>
      {chatRoomIds.length === 0 ? (
        <Typography>Select a Chat to Join</Typography>
      ) : (
        <TabContext value={chatTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChatChange}
              aria-label="lab API tabs example"
              variant="scrollable"
              scrollButtons="auto"
            >
              {chatRoomIds.map((id, index) => {
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
                  const messages = cachedChatRoom.chat_room.messages
                    .slice()
                    .sort((m1, m2) => parseInt(m1.id) - parseInt(m2.id))
                  const lastMessage = messages[messages.length - 1]
                  const nodes = chatRoom.participants.nodes
                  const userNode = nodes.find(
                    (p) =>
                      p.sender.id === currentHealthGuideId &&
                      p.sender.__typename === 'HealthGuide'
                  )
                  hasNew =
                    lastMessage.id > (userNode.last_read_message_id || -1)
                }

                hasNewMessage.push(hasNew)
                if (
                  cachedChatRoom &&
                  index === chatRoomIds.size - 1 &&
                  hasNewMessage.some((n) => n) !== newUnreadMessage
                ) {
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
      )}
    </>
  )
}
