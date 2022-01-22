import { gql } from '@apollo/client'

export const CHATROOM_FRAGMENT = gql`
  fragment ChatRoomFragment on ChatRoom {
    id
    category
    owner {
      name
    }
    last_read_message
  }
`
