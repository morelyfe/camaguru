import{ createStore } from 'redux';

// import logger from 'redux-logger';
// import thunk from 'redux-thunk';

import reducers from './reducers';

// const middleware = applyMiddleware(thunk, logger)

const store = createStore(
    reducers,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;