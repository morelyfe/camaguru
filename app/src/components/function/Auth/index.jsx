import React from 'react';

import { useSelector } from 'react-redux';

import Signin from '../Signin';
import Signup from '../Signup';
import Forgot from '../Forgot';

const Auth = () => {
    const auth = useSelector(state => state.auth);

    return (
        <div className='auth'>
            { auth.isRegister ? <Signup /> : (auth.isForgot ? <Forgot /> : <Signin /> )}
        </div>
    );
}

export default Auth;