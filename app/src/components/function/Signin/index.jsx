import React from 'react';

import { useDispatch } from 'react-redux';
import { auth_token, auth_isregister, auth_isforgot, user_user, user_biotemp, post_posts } from '../../../actions';

import axios from 'axios';
import cookie from 'react-cookies';

import { confirmAlert } from 'react-confirm-alert';
import './index.css';

const Signin = () => {
	const dispatch = useDispatch();

	const _handleForm = (e) => {
		e.preventDefault();
		axios.post('/auth/signin', {
			email: document.signin.email.value,
			password: document.signin.password.value
		})
		.then(res => {
			
			if(res.data.success === false || !res.data) {
				confirmAlert({
					message: 'Email or password information is wrong!',
					buttons: [
						{
							label: 'Okay'
						}
					]
				});
			} else if(res.data.user.confirmed === 0) { // This not go through
				confirmAlert({
					message: 'This email account has not verified yet!',
					buttons: [
						{
							label: 'Request resend email',
							onClick: () => _handleVerifyingEmail()
						},
						{
							label: 'Okay'
						}
					]
				});
			} else if(res.data.success === true) {
				dispatch(auth_token(res.data.token));
				cookie.save('token', res.data.token, { path: '/' });
				dispatch(post_posts([]));
				_handleData(res.data.user);
			}
		});
	}

	const _handleData = (user) => {

		axios.post('/users/select', {
			id: user.id
		})
		.then(res => {
			if(res.data !== null) {
				dispatch(user_user(res.data));
				dispatch(user_biotemp(res.data.bio === null ? '' : res.data.bio));
			}
		});
	}

	const _handleVerifyingEmail = () => {
		axios.post('/auth/email', {
			email: document.signin.email.value
		});
	}

	return (
		<div className='signin'>
			<div className='signin-title'>Sign in!</div>
			<form name='signin' onSubmit={_handleForm}>
				<input className='signin-input' type='email' name='email' placeholder='Email Address' required />
				<input className='signin-input' type='password' name='password' placeholder='Password' required />
				<button className='signin-btn' type='submit'>Sign in</button>
			</form>
			<p onClick={() => dispatch(auth_isforgot())}><span>Forgot password?</span></p>
			<p>Don't have an account? <span onClick={() => dispatch(auth_isregister())}>Sign up!</span></p>
		</div>
	);
}

export default Signin;
