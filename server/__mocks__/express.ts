/**
 * Jest mock for the "express" package.
 */

export const Router = jest.fn().mockReturnValue({
  use: jest.fn(),
});

const express = jest.fn().mockReturnValue({
  listen: jest.fn(),
  use: jest.fn(),
});

export default express;
