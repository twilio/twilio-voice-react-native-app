export const getUserInfo = jest.fn().mockResolvedValue({
  success: true,
  userInfo: {
    email: 'mock-email',
    email_verified: 'mock-email-verified',
    name: 'mock-name',
    nickname: 'mock-nickname',
    picture: 'mock-picture',
    sub: 'mock-sub',
    updated_at: 'mock-updated-at',
  },
});
