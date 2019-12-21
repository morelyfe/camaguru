import { combineReducers } from 'redux';

import uiReducer from './uiReducer';
import authReducer from './authReducer';
import userReducer from './userReducer';
import cameraReducer from './cameraReducer';
import contentReducer from './contentReducer';
import postReducer from './postReducer';
import notificationReducer from './notificationReducer';
import searchReducer from './searchReducer';

const reducers = combineReducers({
    ui: uiReducer,
    auth: authReducer,
    user: userReducer,
    camera: cameraReducer,
    content: contentReducer,
    post: postReducer,
    notification: notificationReducer,
    search: searchReducer,
})

export default reducers;