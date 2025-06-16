module.exports = (req, res, next) =>{
    if(!req.session.userId) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }
    next();
}