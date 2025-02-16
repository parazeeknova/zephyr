import kyInstance from '@/lib/ky';

export const searchMutations = {
  addSearch: async (query: string) => {
    return await kyInstance.post('/api/search', { json: { query } });
  },

  clearHistory: async () => {
    return await kyInstance.delete('/api/search', {
      searchParams: { type: 'history' },
    });
  },

  removeHistoryItem: async (query: string) => {
    return await kyInstance.delete('/api/search', {
      searchParams: {
        type: 'history',
        query,
      },
    });
  },
};
