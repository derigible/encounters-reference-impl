import {
  ApolloClient,
  InMemoryCache,
  from,
  split,
  HttpLink,
  
} from '@apollo/client'
import { setContext } from 'apollo-link-context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'

import { createActionCableLink } from './actionCableHelpers'

export const cache = new InMemoryCache()

export default function createClient({ path, token }) {
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

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        'Rightway-Consumer-Version': 'Advocate WEB Application',
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  })
  
  const hasSubscriptionOperation = ({ query: { definitions } }) =>
    definitions.some(
      ({ kind, operation }) =>
        kind === 'OperationDefinition' && operation === 'subscription'
    )
  // depending on some errors (specially network errors) we may want the requests to be retried automatically
  const retryLink = new RetryLink()
  const httpLink = new HttpLink({
    uri: process.env.REACT_APP_GRAPHQL_HOST + path,
  })
  const channelName = path === 'graphql' ? 'GraphqlChannel' : 'ConsumerGraphqlChannel'
  
  return new ApolloClient({
    link: from([
      retryLink,
      errorLink,
      authLink,
      split(hasSubscriptionOperation, createActionCableLink(token, channelName), httpLink),
    ]),
    cache,
    connectToDevTools: true,
  })
}

