const User = require('../models/User');

module.exports.renderSignup = (req, res) =>{
    res.render('signup', {title: 'Sign Up'});
};

module.exports.signup = async (req, res) =>{
    const {email, password, passwordConfirm} = req.body;
    
    // finding and verifying user
    const existingUser = await User.findOne({email});
    if(existingUser){
        req.flash('error', 'Email already in use, please Login to continue.');
        return res.redirect('/login');
    }
    const user = new User({email, password});
    await user.save();

    req.flash('success', 'Signup successful! Please login.')
    res.redirect('/login');
};

module.exports.renderLogin = (req, res) =>{
    res.render('login', {title: 'Login'});
};

module.exports.login = async (req, res) =>{
    const {email, password} = req.body;
    
    const user = await User.findOne({email});
    if(!user){
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
    }
    const isMatched = await user.comparePassword(password);
    if(!isMatched){
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
    }
    // Save user id in session
    req.session.userId = user._id;
    req.flash('success', 'Logged in successfully!');
    res.redirect('/urls');
}


module.exports.logout = (req, res) => {
    req.flash('success', 'Successfully logged out');
    req.session.destroy(err =>{
        if(err) return next(err);
        // Can't store flash after session destroyed, so send flash as a query param or use temp cookie.
        res.redirect('/login?logout=1');
    })
};