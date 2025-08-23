import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/link-context';

// Configuration constants - following clean code principles
const HASURA_GRAPHQL_ENDPOINT = 'https://case-project.hasura.app/v1/graphql';

// HTTP link for GraphQL operations
const httpLink = createHttpLink({
  uri: HASURA_GRAPHQL_ENDPOINT,
});

// Context link for adding headers (useful for authentication later)
const authLink = setContext((_, { headers }: { headers?: any }) => {
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Add any additional headers here (e.g., API keys, auth tokens)
      // 'x-hasura-admin-secret': 'your-admin-secret', // Uncomment if needed
    }
  };
});

// Apollo Client instance with proper configuration
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    // Cache configuration for better performance
    typePolicies: {
      Query: {
        fields: {
          // Add field policies here if needed for specific caching strategies
        },
      },
    },
  }),
  // Enable error handling and debugging
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Export the client for use in the app
export default apolloClient;

