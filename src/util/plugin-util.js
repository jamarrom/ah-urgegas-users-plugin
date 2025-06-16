const  scopes = require('./dist/scopes.js');
const password = require('./dist/password');
const regex = require('./dist/regex');
const transporter = require('./dist/transporter');
const tokenConfig = require('./dist/token-config');

module.exports = {
  scopes: scopes,
  password: password,
  regex: regex,
  transporter: transporter,
  tokenConfig: tokenConfig
}