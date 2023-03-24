/**
 * NOTE(mhuynh): Due to a Typescript issue, multiple type packages (in this case
 * @types/node and @types/react-native) that declare globals will clash and
 * result in improper typings.
 *
 * This export manually types the setTimeout global to the React Native
 * signature.
 *
 * Along with the proper React Native type, this module can also be Jest
 * module-mocked more easily than a global.
 */
export const setTimeout = globalThis.setTimeout as unknown as (
  handler: () => void,
  timeout: number,
) => number;
