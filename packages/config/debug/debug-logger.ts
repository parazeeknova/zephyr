const DEBUG = process.env.NODE_ENV === "development";

export const debugLog = {
  cache: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[Cache ${new Date().toISOString()}]`, message, ...args);
  },
  views: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[Views ${new Date().toISOString()}]`, message, ...args);
  },
  mutation: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[Mutation ${new Date().toISOString()}]`, message, ...args);
  },
  api: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[API ${new Date().toISOString()}]`, message, ...args);
  },
  component: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[Component ${new Date().toISOString()}]`, message, ...args);
  },
  state: (message: string, ...args: any[]) => {
    if (DEBUG)
      console.log(`[State ${new Date().toISOString()}]`, message, ...args);
  }
} as const;
