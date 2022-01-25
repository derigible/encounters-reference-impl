import { gql } from '@apollo/client'

export const CHATROOM_FRAGMENT = gql`
  fragment ChatRoomFragment on ChatRoom {
    id
    category
    owner {
      id
      name
    }
    participants {
      nodes {
        sender {
          id
          name
        }
        last_read_message_id
      }
    }
  }
`
