module.exports = {
    confirm: (id, email) => ({
        subject: 'Camaguru Confirm Email',
        html: `
            <a href='http://localhost:3000/confirm/${id}/${email}'>
            Click to confirm email!
            </a>
        `,
        text: `Copy and paste this link: http://localhost:3000/confirm/${id}/${email}`
    }),
    passReset: (password) => ({
        subject: 'Your New Password for Camaguru',
        html: `
            <p>Here is your new Password: ${password}</p>
            <br />
            <p>Let's Go Back to Camaguru and Login! <a href='http://localhost:3000'>Click here!</a></p>
        `
    })
}