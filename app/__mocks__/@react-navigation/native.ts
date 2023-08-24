export const mockNavigationContainerRef = {
  isReady: jest.fn().mockReturnValue(false),
};
export const createNavigationContainerRef = jest
  .fn()
  .mockReturnValue(mockNavigationContainerRef);
