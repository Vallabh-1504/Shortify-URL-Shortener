const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Enter a valid email address.',
    }),
    password: Joi.string()
        .min(6)
        .max(30)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')) // atleast 1 uppercase, 1 lowercase, 1 number
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be atleast 6 characters',
            'string.pattern.base': 'Password must contain uppercase, lowercase and a number',
        }),
    
    passwordConfirm: Joi.any().equal(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
        'any.required': 'Confirm password is required.',
    }),
}); 

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
    'string.email': 'Enter a valid email',
    'string.empty': 'Email is required',
    }),

    password: Joi.string().required().messages({
    'string.empty': 'Password is required.',
    }),
});

const urlSchema = Joi.object({
    redirectURL: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required()
        .messages({
            'string.uri': 'Enter a valid URL starting with http/https.',
            'string.empty': 'URL cannot be empty.',
        }),
});

module.exports = {signupSchema, loginSchema, urlSchema};