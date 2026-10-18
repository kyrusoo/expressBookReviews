const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie-based session for customer login and authenticated reviews.
app.use('/customer', session({
  secret: 'fingerprint_customer',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true },
}));

// All /customer/auth/* requests require a valid login token.
app.use('/customer/auth', (req, res, next) => {
  const authorization = req.session && req.session.authorization;
  if (!authorization || !authorization.accessToken) {
    return res.status(401).json({ message: 'User not logged in' });
  }

  try {
    req.user = jwt.verify(authorization.accessToken, 'access');
    return next();
  } catch (error) {
    return res.status(403).json({ message: 'User not authenticated' });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

const PORT = Number(process.env.PORT) || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
