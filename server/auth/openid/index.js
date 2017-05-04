'use strict';

import express from 'express';
import passport from 'passport';
import {setTokenCookie} from '../auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('openid', {session: false}))
  .get('/callback', function(req, res, next) {
    passport.authenticate('openid', {
      session: false
    }, function(err, user) {
      if(err) return next(err);
      // Redirect if it fails
      if(!user) return res.redirect('/signup');
      req.user = user;
      req.session.openid = user.openid;
      return next();
    })(req, res, next);
  }, setTokenCookie)
  .get('/logout', function(req, res) {
    const session = req.session;
    const tokenSet = session && session.openid && session.openid.tokenSet ? session.openid.tokenSet : null;
    if(!tokenSet) return res.status(200).end();
    const redirectUrl = req.get('referer');
    const params = `post_logout_redirect_uri=${redirectUrl}&id_token_hint=${tokenSet.id_token}`;
    const endSessionEndpoint = session.openid.issuer.end_session_endpoint;
    return res.redirect(`${endSessionEndpoint}?${params}`);
  });

export default router;
