import HealthGuideChat from './HealthGuideChat'
import ActiveChatsTabs from './ActiveChatsTabs'

export default function ActiveChats({
  chatRoomIds,
  chatTab,
  data,
  currentHealthGuideId,
  chatRoomsData,
  setActiveMessagesCount,
  closeChat,
  handleChatChange,
  newUnreadMessage,
  setNewUnreadMessage,
}) {
  return (
    <>
      <ActiveChatsTabs
        chatRoomIds={chatRoomIds}
        chatTab={chatTab}
        handleChatChange={handleChatChange}
        chatRoomsData={chatRoomsData}
        currentHealthGuideId={currentHealthGuideId}
        newUnreadMessage={newUnreadMessage}
        setNewUnreadMessage={setNewUnreadMessage}
      />
      {chatRoomIds.map((id) => (
        <div
          style={{
            display: chatTab === id ? 'block' : 'none',
            padding: '24px',
          }}
          key={id}
        >
          <HealthGuideChat
            currentUser={data.current_user}
            currentHealthGuideId={currentHealthGuideId}
            chatRoom={chatRoomsData.chat_rooms.find((c) => c.id === id)}
            incrementMessagesCount={() =>
              setTimeout(() =>
                setActiveMessagesCount((currentCount) => currentCount + 1)
              )
            }
            setActiveMessagesCount={(count) =>
              setActiveMessagesCount((currentCount) => currentCount + count)
            }
            closeChat={closeChat}
          />
        </div>
      ))}
    </>
  )
}
