import { GraphQLClient } from 'graphql-request';

/** Base URL for Cube.js REST API */
const CUBEJS_API_URL = 'http://localhost:4000/cubejs-api/v1';

/** Cube.js API token for authentication */
const CUBEJS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTMyNTMzNTYsImV4cCI6MTc1MzMzOTc1Nn0.0QwyGTp1PuMIm_xEvLJkcxTFoUZdGx7wfltidUvLOCs';

// The GraphQL endpoint is typically your API URL with /graphql
const CUBEJS_GRAPHQL_URL = CUBEJS_API_URL.replace('/v1', '/graphql');


/**
 * @purpose
 * - GraphQL client for interacting with Cube.js API.
 * - This client is preconfigured with the Cube.js GraphQL endpoint and authorization header. Use it to send queries and mutations to Cube.js.
 *
 * @param {string} CUBEJS_API_URL - Base URL for Cube.js REST API.
 * @param {string} CUBEJS_TOKEN - Cube.js API token for authentication.
 * @param {string} CUBEJS_GRAPHQL_URL - GraphQL endpoint for Cube.js API.
 * @returns {GraphQLClient} - GraphQL client for interacting with Cube.js API.
 * @throws {Error} Throws if the network request fails or the API returns an error.
 * @sideEffects None
 *
 * @example
 * import { graphqlClient } from './graphqlClient';
 * 
 * const query = `
 *   query {
 *     Orders {
 *       id
 *       total
 *     }
 *   }
 * `;
 * 
 * graphqlClient.request(query)
 *   .then(data => console.log(data))
 *   .catch(error => console.error(error));
 *
 * @throws Will throw an error if the network request fails or the API returns an error.
 */
export const graphqlClient = new GraphQLClient(CUBEJS_GRAPHQL_URL, {
  headers: {
    Authorization: CUBEJS_TOKEN,
  },
});