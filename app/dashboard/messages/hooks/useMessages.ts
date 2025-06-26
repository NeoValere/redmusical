import useSWR from 'swr';

const fetcher = (args: string | [string, string]) => {
  const url = Array.isArray(args) ? `${args[0]}/${args[1]}` : args;
  return fetch(url).then((res) => res.json());
}

export function useMessages(musicianId: string | null) {
  const { data, error } = useSWR(musicianId ? ['/api/messages', musicianId] : null, fetcher);

  return {
    messages: data || [],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useConversations() {
  const { data, error } = useSWR(`/api/conversations`, fetcher);

  return {
    conversations: data || [],
    isLoading: !error && !data,
    isError: error,
  };
}
