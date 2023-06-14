import { getEnvVariable } from '../env';

describe('env variable util', () => {
  it('should notify user if missing env', () => {
    const testVariable = 'something random';
    expect(() => {
      getEnvVariable(testVariable);
    }).toThrowError(`Missing ${testVariable} in .env`);
  });
});
