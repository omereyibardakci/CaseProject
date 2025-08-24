import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/link-context';

// Configuration constants - following clean code principles
const HASURA_GRAPHQL_ENDPOINT = 'https://case-project.hasura.app/v1/graphql';
const HASURA_ADMIN_SECRET = 'yIw1RBHtIFpGxv6GHg9k7nSr2DAtAu58Rjp8W6jFFSsRU1tuVFZlnrJScbfCmi7Z';

// HTTP link for GraphQL operations
const httpLink = createHttpLink({
  uri: HASURA_GRAPHQL_ENDPOINT,
});

// Context link for adding headers (useful for authentication later)
const authLink = setContext((_, { headers }) => {
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Add Hasura admin secret for authentication
      'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
    }
  };
});

// Apollo Client instance with minimal configuration to avoid deprecation warnings
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  // Minimal default options to avoid any deprecated features
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Export the client for use in the app
export default apolloClient;

