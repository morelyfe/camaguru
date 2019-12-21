import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
// import { BrowserRouter as Router } from 'react-router-dom';
import App from './components/template/App';


import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import store from './store';


ReactDOM.render(
    <Provider store={store}>
            <App />
    </Provider>, document.getElementById('root')
);

serviceWorker.unregister();
