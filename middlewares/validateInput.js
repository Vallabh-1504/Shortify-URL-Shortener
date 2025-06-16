module.exports = (schema) =>{
    return (req, res, next) =>{
        const {error} = schema.validate(req.body);
        if(error){
            const msg = error.details.map(el => el.message).join('<br>');
            req.flash('error', msg);
            return res.redirect(req.originalUrl);
        }
        next();
    };
};