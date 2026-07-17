import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../services/api.js';
import { setCredentials, setError, setLoading } from './authSlice.js';

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/auth/signup', userData);
      dispatch(setCredentials(response.data));
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Registration failed.';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await api.post('/auth/signin', userData);
      dispatch(setCredentials(response.data));
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      dispatch(setError(message));
      return rejectWithValue(message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);
