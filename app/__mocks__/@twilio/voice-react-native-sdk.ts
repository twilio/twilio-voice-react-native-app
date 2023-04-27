export const register = jest.fn().mockResolvedValue(undefined);

export const Voice = jest.fn().mockReturnValue({
  register,
});
