const express = require("express");
const router = express.Router();
const jwt = require( 'jsonwebtoken' );

const accessKey = process.env.CKEDITOR_ACCESS_KEY;
const environmentId = process.env.CKEDITOR_ENV_ID;



router.get( '/ckeditor', ( req, res ) => {
    const payload = {
        aud: environmentId,
        sub: '#80105',
        user: {
            email: 'agborayuk099@gmail.com',
            name: 'ayuk'
        },
        "auth": {
            "ckbox": {
                "role": "admin"
            }
        }
        
    };

    const result = jwt.sign( payload, accessKey, { algorithm: 'HS256', expiresIn: '24h' } );

    res.send( result );
} );

module.exports = router;
