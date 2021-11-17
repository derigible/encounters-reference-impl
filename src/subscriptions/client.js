import {
  ApolloClient,
  InMemoryCache,
  from,
  split,
  HttpLink,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'

import { createActionCableLink, getTypeAndId } from './actionCableHelpers'

export const cache = new InMemoryCache()

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, response }) => {
    if (operation.operationName.includes('IgnoreErrors')) {
      if (response) {
        response.errors = null
      }
      return
    }

    if (graphQLErrors) console.log(`[GraphqlErrors error]: ${graphQLErrors}`)
    if (networkError) console.log(`[Network error]: ${networkError}`)
  }
)

const hasSubscriptionOperation = ({ query: { definitions } }) =>
  definitions.some(
    ({ kind, operation }) =>
      kind === 'OperationDefinition' && operation === 'subscription'
  )
// depending on some errors (specially network errors) we may want the requests to be retried automatically
const retryLink = new RetryLink()
const httpLink = new HttpLink({
  uri: 'http://localhost:3000/graphql' + getTypeAndId(),
})

const client = new ApolloClient({
  link: from([
    retryLink,
    errorLink,
    split(hasSubscriptionOperation, createActionCableLink(), httpLink),
  ]),
  cache,
  connectToDevTools: true,
})
export default client
