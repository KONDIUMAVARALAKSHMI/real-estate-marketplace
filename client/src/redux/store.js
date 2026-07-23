import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import marketplaceReducer from './features/marketplace/marketplaceSlice';
import themeReducer from './features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    marketplace: marketplaceReducer,
    theme: themeReducer,
  },
});
