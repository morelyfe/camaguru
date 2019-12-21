import React from 'react';

import { useDispatch } from 'react-redux';
import { auth_isregister } from '../../../actions';

import axios from 'axios';

import { confirmAlert } from 'react-confirm-alert';

const Signup = () => {
	const dispatch = useDispatch();

	const _handleForm = (e) => {
		e.preventDefault();
		if(_handlePasswordCheck() !== 0) {
			confirmAlert({
				message: 'Passwords is not enough safety!',
				buttons: [
					{
						label: 'Okay'
					}
				]
			});
		} else {
			const email = document.signup.email.value;
			const password = document.signup.password.value;
			const username = document.signup.username.value;
			
			axios.post('/auth/signup', {
				username: username,
				email: email,
				password: password,
			})
			.then(res => {
				if(res.data.errors) {
					confirmAlert({
						message: 'This email is already registered!',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
				} else {
					confirmAlert({
						message: 'Thank you so much! Please check your email for confirmation',
						buttons: [
							{
								label: 'Okay'
							}
						]
					})
					axios.post('/auth/email', {
						email: email
					})
					.then(res => {
						console.log(res.data.msg);
						// if(res.data.msg) {
						// 	console.log(res.data.msg);
						// } else {
						// 	console.log("email error: Need to handle this.");
						// }
					})
				}
			});
			dispatch(auth_isregister());
		}
	}

	const _handlePasswordCheck = () => {
		const password = document.signup.password.value;
		const confirm = document.signup.confirm.value;

		const pattern1 = /[0-9]/;
        const pattern2 = /[a-zA-Z]/;
		const pattern3 = /[~!@#$%<>^&*]/;

		document.getElementById('signin-password-check-1').style.color = '#00796B';
		document.getElementById('signin-password-check-2').style.color = '#00796B';
		document.getElementById('signin-password-check-3').style.color = '#00796B';

		let error = 0;
		
		if(!(8 <= password.length && password.length <= 20)) {
			document.getElementById('signin-password-check-1').style.color = '#D32F2F';
			error++;
		}

		if(!pattern1.test(password) || !pattern2.test(password) || !pattern3.test(password)) {
			document.getElementById('signin-password-check-2').style.color = '#D32F2F';
			error++;
		}

		if(password === '' || password !== confirm) {
			document.getElementById('signin-password-check-3').style.color = '#D32F2F';
			error++;
		}

		return error;
	}

	return (
		<div className='signin'>
			<div className='signin-title'>Sign up!</div>
			<form name='signup' onSubmit={_handleForm}>
				<input className='signin-input' type='text' name='username' placeholder='Username' required />
				<input className='signin-input' type='email' name='email' placeholder='Email Address' required />
				<input className='signin-input' type='password' name='password' placeholder='Password' onChange={ () => _handlePasswordCheck() } required />
				<input className='signin-input' type='password' name='confirm' placeholder='Confirm Password' onChange={ () => _handlePasswordCheck() } required />
				<div id='signin-password-checker' className='signup-password-check'>
					<p id='signin-password-check-1'>- Password has to be within 8 ~ 20 characters.</p>
					<p id='signin-password-check-2'>- Include upper case and special characters.</p>
					<p id='signin-password-check-3'>- Please confirm your password.</p>
				</div>
				<button className='signin-btn' type='submit'>Sign up</button>
			</form>
			<p>Do you have an account? <span onClick={() => dispatch(auth_isregister())}>Sign in!</span></p>
		</div>
	);
}

export default Signup;
