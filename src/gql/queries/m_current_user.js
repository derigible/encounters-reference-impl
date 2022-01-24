import { gql } from '@apollo/client'

export const M_CURRENT_USER_QUERY = gql`
  query MCurrentUser {
    currentUser {
      employee_id
    }
  }
`
