export const pool = {
  query: async (sql: string) => {
    // Mock für Tests
    return { rows: [{ status: 'ok' }] };
  }
};
