// protecting routes
const User = require("../models/User");

module.exports = {
    ensureAuth: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }else{
            res.redirect('/blog/login');
        }
    },
    ensureGuest: function(req, res, next){
        if(req.isAuthenticated()){
            res.redirect('/blog/dashboard/' + req.user.id);
        }else{
            return next();
        }
    },
    ensureToken: function(req, res, next){
        if(req.body.token === process.env.SECRET){
            return next();
        }else{
            res.render("error")
        }
    },
    ensureAdminToken:  function(req, res, next){
        if(req.body.admintoken === process.env.S3_ACCESS_KEY_ID){
            return  next()
        }else{
            res.render("error")
        }
    },
    ensureAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.privilege === "admin"){
            return next();
        }else{
            res.status(401).json("Unauthorised")
        }
    }
}