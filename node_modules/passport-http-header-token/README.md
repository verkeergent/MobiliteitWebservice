# passport-http-header-token
[Passport](http://passportjs.org/) strategy for authenticating with a http header token - based on [passport-local](https://github.com/jaredhanson/passport-local).

This module lets you authenticate using a username and password in your Node.js
applications.  By plugging into Passport, local authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-http-header-token

## Usage

#### Configure Strategy

The http header token authentication strategy authenticates users using a token.
The strategy requires a `verify` callback, which accepts the
credential and calls `done` providing a user.

    passport.use(new HTTPHeaderTokenStrategy(
      function(token, done) {
        User.findOne({ token: token }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          return done(null, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'http-header-token'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login',
      passport.authenticate('http-header-token', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [HTTP Header Token example](https://github.com/peralmq/passport-http-header-token/tree/master/examples/http-header-token).

## Tests

    $ npm install
    $ npm test

## Credits

  - [Jared Hanson](http://github.com/jaredhanson)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2011-2014 Pelle Almquist
