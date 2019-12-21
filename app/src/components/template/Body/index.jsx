import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { post_posts, post_isdone } from '../../../actions';

import axios from 'axios';

import Post from '../../function/Post';
import Search from '../../function/Search';
import Camera from '../../function/Camera';
import Notification from '../../function/Notification';
import Mypage from '../../function/MyPage';
import Detail from '../../function/Detail';

import './index.css';

const Body = () => {
	const ui = useSelector(state => state.ui);
	const auth = useSelector(state => state.auth);
	const content = useSelector(state => state.content);
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	let post = useSelector(state => state.post);
	var isLoad = false;

	const _handleExploreScroll = (e) => {
		if(ui.nav === 0 && post.isDone === false && isLoad === false) {
			if(e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight) > 0.9) {
				isLoad = true;
				axios.post('/posts/selectAll', {
					token: auth.token,
					user_id: user.user.id,
					call: parseInt(post.posts[post.posts.length - 1].id),
				})
				.then(res => {
					let posts = post.posts;
					if(res.data.length === 0) {
						dispatch(post_isdone(true));
					} else {
						dispatch(post_posts(posts.concat(res.data)));
					}
				})
				.then(() => {
					isLoad = false;
				});
			}
		}
	}

	return (
		<div className='body' onScroll={_handleExploreScroll}>
			{ ui.nav === 0 || ui.nav === 1 ? 
				<div className='inner-container'>
					{post.posts.map((post) => 
						<Post key={post.id} data={post} />
					)}
				</div>
			: '' }
			{ ui.nav === 2 ? <Search /> : '' }
			{ ui.nav === 3 ? <Camera /> : '' }
			{ ui.nav === 4 ? <Notification /> : '' }
			{ ui.nav === 5 ? <Mypage /> : '' }
			{ ui.nav === 6 ? <Detail id={content.id} /> : '' }
		</div>
	);
}

export default Body;
