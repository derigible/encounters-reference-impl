import { gql } from '@apollo/client'

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    current_user {
      id
      health_guide {
        id
      }
    }
  }
`
