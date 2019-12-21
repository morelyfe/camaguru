//passport give all the info

module.exports = {
    ensureAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()) {
            console.log('Yes auth okay');
            return next();
        }
        console.log('not not okay');
        res.send("User need to login");
        // req.flash('error_msg', 'Please log in to view this resource');
        // res.redirect('/users/login');
    }
}