import { gql, useMutation } from "@apollo/client";

const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($eventData: String!) {
    createEvent(eventData: $eventData) {
      ... on MarketEvent {
        id
        userAddress
        toAddress
        proxyAddress
        amount
        contractAddress
        transactionHash
        eventType
        error
      }
    }
  }
`;

export const useCreateEventMutation = () => {
  const [createEventMutation, { data, loading, error }] = useMutation(CREATE_EVENT_MUTATION);
  return { createEventMutation, data, loading, error };
};
