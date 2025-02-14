const DEBUG = process.env.NODE_ENV === 'development';

export const debugLog = {
  // biome-ignore lint/suspicious/noExplicitAny: any is used to allow for any number of arguments
  cache: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[Cache ${new Date().toISOString()}]`, message, ...args);
    }
  },
  // biome-ignore lint/suspicious/noExplicitAny: same as above
  views: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[Views ${new Date().toISOString()}]`, message, ...args);
    }
  },
  // biome-ignore lint/suspicious/noExplicitAny: same as above
  mutation: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[Mutation ${new Date().toISOString()}]`, message, ...args);
    }
  },
  // biome-ignore lint/suspicious/noExplicitAny: same as above
  api: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[API ${new Date().toISOString()}]`, message, ...args);
    }
  },
  // biome-ignore lint/suspicious/noExplicitAny: same as above
  component: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[Component ${new Date().toISOString()}]`, message, ...args);
    }
  },
  // biome-ignore lint/suspicious/noExplicitAny: same as above
  state: (message: string, ...args: any[]) => {
    if (DEBUG) {
      console.log(`[State ${new Date().toISOString()}]`, message, ...args);
    }
  },
} as const;
