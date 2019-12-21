import React from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { auth_token, user_user, user_biotemp, post_posts, post_isdone } from '../../../actions';

import axios from 'axios';
import cookie from 'react-cookies';

import Header from '../Header';
import Body from '../Body';
import Footer from '../Footer';
import Sidebar from '../../function/Sidebar';
import Cover from '../../function/Cover';

import Confirm from '../Confirm';

import Wrapper from 'react-div-100vh';

import './index.css';

const App = () => {
	const ui = useSelector(state => state.ui);
	const auth = useSelector(state => state.auth);
	const post = useSelector(state => state.post);
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	const _handleData = (token) => {
		axios.post('/users/select', {
			token: token,
		})
		.then(res => {
			if(res.data !== '') {
				dispatch(user_user(res.data));
				dispatch(user_biotemp(res.data.bio === null ? '' : res.data.bio));
			} else {
				cookie.remove('token', { path: '/'});
				dispatch(auth_token(''));
			}
		});
	}

	if(auth.token === '' && cookie.load('token') !== undefined) {
		dispatch(auth_token(cookie.load('token')));
		_handleData(cookie.load('token'));
	}

	if((ui.nav === 0 || ui.nav === 1) && post.posts.length === 0 && !post.isDone) {
		axios.post('/posts/selectAll', {
			token: auth.token,
			user_id: user.user.id,
		})
		.then(res => {
			if(res.data.length === 0) {
				dispatch(post_isdone(true));
			} else {
				dispatch(post_posts(res.data));
			}
		});
	}

	const content = () => {
		return (
			<BrowserRouter>
				<Switch>
					<Route exact path="/confirm/:id/:email" component={Confirm} />
					<Redirect from='*' to='/' />
				</Switch>
			</BrowserRouter>
		)
	}
	return (
		<Wrapper className='app no-drag'>
			{content()}
			<Header />
			<Body />
			<Footer />
			{ ui.nav === 1 ? <div className='sidebar-cover' /> : '' }
			{ ui.nav === 1 ? <Sidebar /> : '' }
			<Cover />
		</Wrapper>
	);
}

export default App;
