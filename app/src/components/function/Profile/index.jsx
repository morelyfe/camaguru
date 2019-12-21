import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ui_nav, auth_token, auth_isaccount, user_user, user_biotemp, post_posts, post_isdone } from '../../../actions';

import axios from 'axios';
import cookie from 'react-cookies';

import { confirmAlert } from 'react-confirm-alert';

// import default_user from './logo.png';
import default_user from '../../../resources/default_user.jpg';
import './index.css';

const Profile = () => {
	const auth = useSelector(state => state.auth);
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	const _handleForm = (e) => {
		e.preventDefault();
		document.getElementById('cover').style.display = 'block';
		axios.post('/users/update', {
			token: auth.token,
			id: user.user.id,
			email: document.changeProfile.email.value,
			username: document.changeProfile.username.value,
			bio: user.bioTemp,
		})
		.then(res => {
			if(res.data) {
				if(document.changeProfile.email.value !== user.user.email) {
					confirmAlert({
						message: 'Email has changed. Please sign in again!',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
					_handleLogout();
				} else {
					_handleData(auth.token);
				}
			} else {
				confirmAlert({
					message: 'This email is taken already!',
					buttons: [
						{
							label: 'Okay'
						}
					]
				});
			}
			setTimeout(() => {
				document.getElementById('cover').style.display = 'none';
			}, 1000);
		});
	}

	const _handleChangePassword = (e) => {
		e.preventDefault();
		if(_handlePasswordCheck() !== 0) {
			confirmAlert({
				message: 'Passwords is not valid!',
				buttons: [
					{
						label: 'Okay'
					}
				]
			});
		} else {
			document.getElementById('cover').style.display = 'block';
			axios.post('/users/updatePassword', {
				token: auth.token,
				email: user.user.email,
				password: document.changePassword.current.value,
				change: document.changePassword.change.value,
			})
			.then(res => {
				if(res.data) {
					confirmAlert({
						message: 'Password has changed. Please sign in again!',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
					_handleLogout();
				} else {
					confirmAlert({
						message: 'Current password is not matched',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
				}
				setTimeout(() => {
					document.getElementById('cover').style.display = 'none';
				}, 1000);
			});
		}
	}

	const _handlePasswordCheck = () => {
		const password = document.changePassword.change.value;
		const confirm = document.changePassword.confirm.value;

		const pattern1 = /[0-9]/;
        const pattern2 = /[a-zA-Z]/;
		const pattern3 = /[~!@#$%<>^&*]/;

		document.getElementById('changePassword-password-check-1').style.color = '#00796B';
		document.getElementById('changePassword-password-check-2').style.color = '#00796B';
		document.getElementById('changePassword-password-check-3').style.color = '#00796B';

		let error = 0;
		
		if(!(8 <= password.length && password.length <= 20)) {
			document.getElementById('changePassword-password-check-1').style.color = '#D32F2F';
			error++;
		}

		if(!pattern1.test(password) || !pattern2.test(password) || !pattern3.test(password)) {
			document.getElementById('changePassword-password-check-2').style.color = '#D32F2F';
			error++;
		}

		if(password === '' || password !== confirm) {
			document.getElementById('changePassword-password-check-3').style.color = '#D32F2F';
			error++;
		}

		return error;
	}
	const _handleChangePicture = (e) => {
		e.preventDefault();
		let input = document.getElementById('file');
		let extension = input.value.split('.')[input.value.split('.').length - 1];
		if(extension === 'jpg' || extension === 'jpeg' || extension === 'png') {
			document.getElementById('cover').style.display = 'block';
			let formData = new FormData();
			formData.append("token", auth.token);
			formData.append("id", user.user.id);
			formData.append("picture", document.changePicture.file.files[0]);
			axios.post('/users/updatePicture', formData, {
				headers: {
				'Content-Type': 'multipart/form-data'
				}
			}).then(res => {
				if(res.data.success === true) {
					dispatch(post_posts([]));
					dispatch(post_isdone(false));
					_handleData(auth.token);
				} else if (res.data.success === false) {
					confirmAlert({
						message: 'testing',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
				} else {
					cookie.remove('token', { path: '/'});

					dispatch(auth_token(''));
					dispatch(user_user({}));
					dispatch(user_biotemp(''));
					dispatch(ui_nav(0));

					confirmAlert({
						message: 'The session is no longer valid!',
						buttons: [
							{
								label: 'Okay'
							}
						]
					});
				}
				setTimeout(() => {
					document.getElementById('cover').style.display = 'none';
				}, 1000);
			});
		} else {
			input.value = '';
			confirmAlert({
				message: 'Extension of image can be only .jpg, .jpeg, .png!',
				buttons: [
					{
						label: 'Okay'
					}
				]
			});
		}
	}

	const _handleData = (token) => {
		axios.post('/users/select', {
			token: token
		})
		.then(res => {
			if(res.data !== null) {
				dispatch(user_user(res.data));
				dispatch(user_biotemp(res.data.bio === null ? '' : res.data.bio));
				dispatch(post_posts([]));
				dispatch(post_isdone(false));
			} else {
				cookie.remove('token', { path: '/'});

				dispatch(auth_token(''));
				dispatch(user_user({}));
				dispatch(user_biotemp(''));
				dispatch(ui_nav(0));

				confirmAlert({
					message: 'The session is no longer valid!',
					buttons: [
						{
							label: 'Okay'
						}
					]
				});
			}
		});
	}

	const _handleLogout = () => {
		axios.get('/users/logout')
		.then(res => {			
			cookie.remove('token', { path: '/'});
			dispatch(auth_token(''));
			dispatch(user_user({}));
			dispatch(user_biotemp(''));
			dispatch(post_posts([]));
			dispatch(post_isdone(false));
			dispatch(ui_nav(0));
		})
	}

	const _handleTextareaSize = () => {
		const e = document.getElementById('profile-bio');
		dispatch(user_biotemp(e.value));
		e.style.height = '5px';
		e.style.height = 'calc(' + (e.scrollHeight) + 'px - 1rem)';
	}
	
	return (
		<div className='profile'>1
			<div className='profile-profile'
				style={
					user.user.picture === null || user.user.picture === undefined
					?
					{ backgroundImage: 'url(\'' + default_user + '\')' }
					:
					{ backgroundImage: 'url(\'/images/' + user.user.picture + '\')' }
				}
			></div>
			<div className='profile-change-profile' onClick={() => document.changePicture.file.click()}>Change Profile Picture</div>
			<form name='changePicture' encType="multipart/form-data">
				<input id='file' type='file' name='file' onChange={_handleChangePicture} style={{display: 'none'}} />
			</form>
			<form name='changeProfile' onSubmit={_handleForm}>
				<span className='profile-placeholder'>Username</span>
				<input className='profile-input' type='text' name='username' required defaultValue={user.user.username} />
				<span className='profile-placeholder'>Email</span>
				<input className='profile-input' type='email' name='email' required defaultValue={user.user.email} />
				<span className='profile-placeholder'>Bio</span>
				<textarea id='profile-bio' className='profile-textbox' name='bio' style={{height: (user.bioTemp !== '' ? user.bioTemp.split('\n').length * 0.75 + 'rem' : '0.75rem') }} value={user.bioTemp} onChange={() => _handleTextareaSize()} onFocus={() => _handleTextareaSize()} />
				<input className='profile-submit' type='submit' value='Update User Information' />
			</form>
			<form name='changePassword' onSubmit={_handleChangePassword}>
				<span className='profile-placeholder'>Current Password</span>
				<input className='profile-input' name='current' type='password' required />
				<span className='profile-placeholder'>Change Password</span>
				<input className='profile-input' name='change' type='password' onChange={ () => _handlePasswordCheck() } required />
				<span className='profile-placeholder'>Confirm Password</span>
				<input className='profile-input' name='confirm' type='password' onChange={ () => _handlePasswordCheck() } required />
				<div className='changePassword-password-check'>
					<p id='changePassword-password-check-1'>- Password has to be within 8 ~ 20 characters.</p>
					<p id='changePassword-password-check-2'>- You need to include upper case and special characters.</p>
					<p id='changePassword-password-check-3'>- Please confirm your password.</p>
				</div>
				<input className='profile-submit' type='submit' value='Update User Password' />
				<input className='profile-logout' type='button' value='Go to Account Setting' onClick={ () => dispatch(auth_isaccount()) } />
				<input className='profile-logout' type='button' value='Logout' onClick={ () => _handleLogout() }/>
			</form>
		</div>
	);
}

export default Profile;