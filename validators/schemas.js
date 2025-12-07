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

const newUrlSchema = Joi.object({
    redirectURL: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required()
        .messages({
            'string.uri': 'Enter a valid URL starting with http/https.',
            'string.empty': 'URL cannot be empty.',
        }),
});

const updateRedirectSchema = Joi.object({
    redirectURL: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required()
        .messages({
            'string.uri': 'Enter a valid URL starting with http/https.',
            'string.empty': 'URL cannot be empty.',
        }),
});

const customShortIdSchema = Joi.object({
    shortId: Joi.string()
        .min(4)
        .max(30)
        .alphanum() // Ensures it's alphanumeric
        .required()
        .messages({
            'string.empty': 'Custom ID cannot be empty.',
            'string.min': 'Custom ID must be at least 4 characters long.',
            'string.max': 'Custom ID must be no more than 30 characters long.',
            'string.alphanum': 'Custom ID must only contain letters and numbers.',
        }),
});

const updateExpirySchema = Joi.object({
    expiresAt: Joi.date()
        .required()
        .messages({
            'date.base': 'Please provide a valid date.',
            'any.required': 'Expiry date is required.',
        }),
});

const otpRequestSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
        'string.email': 'Enter a valid email address.',
        'string.empty': 'Email is required.',
    })
});

const otpVerifySchema = Joi.object({
    email: Joi.string()
        .email()
        .required(),

    otp: Joi.string()
        .length(4)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 4 digits.',
            'string.pattern.base': 'OTP must contain numbers only.'
        })
});


module.exports = {
    signupSchema, loginSchema, 
    newUrlSchema, updateRedirectSchema,
    customShortIdSchema, updateExpirySchema,
    otpRequestSchema, otpVerifySchema,
};