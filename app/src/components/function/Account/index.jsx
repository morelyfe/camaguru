import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { ui_nav, auth_token, auth_isaccount, user_user, user_biotemp, post_posts, post_isdone } from '../../../actions';

import axios from 'axios';
import cookie from 'react-cookies';

import { confirmAlert } from 'react-confirm-alert';
import './index.css';

const Account = () => {
	const auth = useSelector(state => state.auth);
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	const _handleIsPrivate = () => {
		axios.post('/users/updatePrivate', {
			token: auth.token,
			id: user.user.id,
		})
		.then(res => {
			if(res.data.success === true) {
				user.user.isPrivate = !user.user.isPrivate;
				dispatch(user_user(user.user));
			} else if (res.data.success === false) {
				confirmAlert({
					message: 'Somethings went wrong... Please try again later',
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
		});
		
	}

	const _handleIsNotificate = () => {
		axios.post('/users/updateNotificate', {
			token: auth.token,
			id: user.user.id,
		})
		.then(res => {
			if(res.data.success === true) {
				user.user.isNotificate = !user.user.isNotificate;
				dispatch(user_user(user.user));
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

	const _handleDeleteUser = () => {
		confirmAlert({
			message: 'Are you sure you want to delete your account?',
			buttons: [
				{
					label: 'Yes',
					onClick: () => _processDeleteUser()
				},
				{
					label: 'No, Thanks'
				}
			]
		});
	}

	const _processDeleteUser = () => {
		axios.post('/users/delete', {
			token:  auth.token,
			id: user.user.id,
			password: document.getElementsByName("current")[0].value,
		})
		.then(res => {
			if (res.data.success === true) {
				cookie.remove('token', { path: '/'});
				dispatch(auth_token(''));
				dispatch(user_user({}));
				dispatch(user_biotemp(''));
				dispatch(post_posts([]));
				dispatch(post_isdone(false));
				dispatch(ui_nav(0));
				dispatch(auth_isaccount());

				confirmAlert({
					message: 'Your account was successfully deleted',
					buttons: [
						{
							label: 'Okay'
						}
					]
				})
			}
			else if (res.data.success === false) {
				confirmAlert({
					message: res.data.msg,
					buttons: [
						{
							label: 'Okay'
						}
					]
				});
			}
			else {
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

	return (
		<div className='account'>
			<span className='account-title'>Private Account</span>
			{ user.user.isPrivate 
				? 
					<div className='account-toggle' onClick={ () => _handleIsPrivate() }>
						<div className='account-toggle-box-active'></div>
						<div className='account-toggle-button-active'></div>
					</div>
				:
					<div className='account-toggle' onClick={ () => _handleIsPrivate() }>
						<div className='account-toggle-box-inactive'></div>
						<div className='account-toggle-button-inactive'></div>
					</div>
			}
			<span className='account-title'>Send Notification</span>
			{ user.user.isNotificate 
				? 
					<div className='account-toggle' onClick={ () => _handleIsNotificate() }>
						<div className='account-toggle-box-active'></div>
						<div className='account-toggle-button-active'></div>
					</div>
				:
					<div className='account-toggle' onClick={ () => _handleIsNotificate() }>
						<div className='account-toggle-box-inactive'></div>
						<div className='account-toggle-button-inactive'></div>
					</div>
			}
			<div className='signin-margin'></div>
			<input className='profile-submit' type='button' value='Back to User Information' onClick={ () => dispatch(auth_isaccount()) } />
			<span className='profile-placeholder'>Current Password</span>
			<input className='profile-input' name='current' type='password' required />
			<input className='profile-delete' type='button' value='Delete Account' onClick={ () => _handleDeleteUser() } />
		</div>
	);
}

export default Account;
