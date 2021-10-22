
/*

session(options)

https://expressjs.com/en/resources/middleware/session.html

Create a session middleware with the given options.

Note Session data is not saved in the cookie itself,
just the session ID. Session data is stored server-side.

*/

// var session = require('express-session');


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------


//session init

app.use(session({
  secret: data.secret_session,
  resave: true,
  saveUninitialized: true,
  cookie : {
        maxAge: 1000* 60 * 60 *24 * 365
    }
}));
