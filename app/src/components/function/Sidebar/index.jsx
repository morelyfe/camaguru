import React from 'react';
import { useSelector } from 'react-redux';

import Auth from '../../function/Auth';
import Profile from '../../function/Profile';
import Account from '../../function/Account';

import './index.css';

const Sidebar = () => {
    const auth = useSelector(state => state.auth);

    return (
        <div className='sidebar'>
            { auth.token === '' ? <Auth /> : (auth.isAccount ? <Account /> : <Profile />) }

        </div>
    )
}

export default Sidebar;