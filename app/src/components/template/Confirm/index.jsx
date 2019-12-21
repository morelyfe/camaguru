import React from 'react';
import { confirmAlert } from 'react-confirm-alert';
import { useParams, Redirect } from 'react-router';
import axios from 'axios';

const Confirm = () => {
    const { id, email } = useParams();

    const confirmHandle = () => {
        axios.post(`/auth/email/confirm/${id}/${email}`)
        .then(res => {
            confirmAlert({
                message: res.data.msg,
                buttons: [
                    {
                        label: 'Okay',
                    }
                ]
            });
        })
        .catch(err => console.log(err))
    }

    return (
        <div className='confirm'>
            {confirmHandle()}
            <Redirect to='/' />
        </div>
    )
}

export default Confirm;