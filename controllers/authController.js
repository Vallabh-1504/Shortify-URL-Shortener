const User = require('../models/User');
const {OAuth2Client} = require('google-auth-library');
require('dotenv').config();

const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
)

module.exports.renderSignup = (req, res) =>{
    res.render('signup', {title: 'Sign Up'});
};

module.exports.signup = async (req, res) =>{
    const {email, password, passwordConfirm} = req.body;
    
    // finding and verifying user
    const existingUser = await User.findOne({email});
    if(existingUser){
        // case-1
        if(existingUser.password){
            req.flash('error', 'Email already in use, please Login to continue.');
            return res.redirect('/login');
        }
        
        // case-2 user exists via Oauth
        else{
            existingUser.password = password;
            await existingUser.save();
            req.session.userId = existingUser._id;
            req.flash('success', 'Password added to your Google account. You can now log in locally!');
            return res.redirect('/urls');
        }
    }

    // case-3 new user
    const user = new User({email, password});
    await user.save();

    req.session.userId = user._id;
    req.flash('success', 'Signup successful!')
    res.redirect('/urls');
};

module.exports.renderLogin = (req, res) =>{
    res.render('login', {title: 'Login'});
};

module.exports.login = async (req, res) =>{
    const {email, password} = req.body;
    
    const user = await User.findOne({email});
    if(!user){
        req.flash('error', 'Email not registered');
        return res.redirect('/login');
    }

    if(!user.password){
        req.flash('error', 'This account was created via Google login. Please use Google Login or set a password via sign up.');
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

module.exports.googleAuth = (req, res) =>{
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    res.redirect(`${rootUrl}?${options.toString()}`);
};

module.exports.googleCallback = async(req, res, next) =>{
    const code = req.query.code;
    if(!code){
        req.flash('error', 'Google authentication failed');
        return res.redirect('/login');
    }

    try{
        const {tokens} = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);

        const ticket = await oAuth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        let user = await User.findOne({googleId: payload.sub});

        if(!user){
            user = await User.findOne({email: payload.email});
            if(user){
                user.googleId = payload.sub;
                await user.save();
            }
            else{
                user = await User.create({
                    email: payload.email,
                    googleId: payload.sub,
                });
            }
        }

        req.session.userId = user._id;
        req.flash('success', 'Logged in with Google!');
        res.redirect('/urls');
    }
    catch(e){
        req.flash('error', 'Google login failed');
        console.log(e);
        res.redirect('/login');
    }
}
