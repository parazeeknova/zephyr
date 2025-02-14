import kyInstance from '@/lib/ky';

export const searchMutations = {
  addSearch: async (query: string) => {
    return kyInstance.post('/api/search', { json: { query } });
  },

  clearHistory: async () => {
    return kyInstance.delete('/api/search', {
      searchParams: { type: 'history' },
    });
  },

  removeHistoryItem: async (query: string) => {
    return kyInstance.delete('/api/search', {
      searchParams: {
        type: 'history',
        query,
      },
    });
  },
};
