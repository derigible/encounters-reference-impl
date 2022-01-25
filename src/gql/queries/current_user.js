import { gql } from '@apollo/client'

export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    current_user {
      id
      name: full_name
      health_guide {
        id
      }
    }
  }
`
