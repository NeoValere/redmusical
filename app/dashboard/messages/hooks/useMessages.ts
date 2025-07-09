import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMessages(conversationId: string | null) {
  const shouldFetch = conversationId ? `/api/messages/${conversationId}` : null;
  const { data, error, mutate } = useSWR(shouldFetch, fetcher);

  const messages = data?.messages || [];
  const conversation = data;

  return {
    messages,
    conversation,
    isLoading: shouldFetch && !error && !data,
    isError: error,
    mutate,
  };
}

export function useConversations(role: string | null) {
  const url = role ? `/api/conversations?role=${role}` : '/api/conversations';
  const { data, error } = useSWR(url, fetcher);

  return {
    conversations: data || [],
    isLoading: !error && !data,
    isError: error,
  };
}
