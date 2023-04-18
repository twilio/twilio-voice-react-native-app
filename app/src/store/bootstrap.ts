import { createAsyncThunk } from '@reduxjs/toolkit';
import { type Dispatch } from './app';
import { checkLoginStatus } from './user';

type BootstrapAppRejectValue = {
  reason?: 'CHECK_LOGIN_STATUS';
  error?: any;
};

export const bootstrapApp = createAsyncThunk<
  void,
  void,
  {
    dispatch: Dispatch;
    rejectValue: BootstrapAppRejectValue;
  }
>('app/bootstrap', async (_, { dispatch, rejectWithValue }) => {
  const checkLoginStatusResult = await dispatch(checkLoginStatus());
  if (checkLoginStatus.rejected.match(checkLoginStatusResult)) {
    return rejectWithValue({ reason: 'CHECK_LOGIN_STATUS' });
  }
});
