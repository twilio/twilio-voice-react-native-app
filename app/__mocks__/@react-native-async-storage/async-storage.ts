export const keyValueStore = new Map();

export const setItem = jest
  .fn()
  .mockImplementation(
    async (key: string, value: string, _cb?: (error?: Error) => void) => {
      keyValueStore.set(key, value);
    },
  );

export const getItem = jest
  .fn()
  .mockImplementation(async (key: string, _cb?: (error?: Error) => void) => {
    return keyValueStore.get(key);
  });

export const getAllKeys = jest.fn().mockImplementation(async () => {
  return Array.from(keyValueStore.keys());
});

export const removeItem = jest.fn().mockImplementation(async (k: string) => {
  keyValueStore.delete(k);
});

export const multiRemove = jest
  .fn()
  .mockImplementation(async (keys: string[]) => {
    for (const k of keys) {
      keyValueStore.delete(k);
    }
  });

export default { setItem, getItem, getAllKeys, multiRemove, removeItem };
