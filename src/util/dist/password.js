const generatePassword = require("password-generator");

/* Configuration */
var maxLength = 25;
var minLength = 8;
var uppercaseMinCount = 3;
var lowercaseMinCount = 3;
var numberMinCount = 2;
var specialMinCount = 2;
var UPPERCASE_RE = /([A-Z])/g;
var LOWERCASE_RE = /([a-z])/g;
var NUMBER_RE = /([\d])/g;
var SPECIAL_CHAR_RE = /([\?\-])/g;
var NON_REPEATING_CHAR_RE = /([\w\d\?\-])\1{2,}/g;

/**
 * A function to validate if a password is strong.
 * @function isStrongEnough
 * @param {string} password - A password that will be tested until is not strong.
 */
isStrongEnough = password => {
  var uc = password.match(UPPERCASE_RE);
  var lc = password.match(LOWERCASE_RE);
  var n = password.match(NUMBER_RE);
  var sc = password.match(SPECIAL_CHAR_RE);
  var nr = password.match(NON_REPEATING_CHAR_RE);
  return (
    password.length >= minLength &&
    !nr &&
    uc &&
    uc.length >= uppercaseMinCount &&
    lc &&
    lc.length >= lowercaseMinCount &&
    n &&
    n.length >= numberMinCount &&
    sc &&
    sc.length >= specialMinCount
  );
};

exports.isStrongEnough = this.isStrongEnough;

/**
 * A function to generate a random password.
 * @function customPassword
 */
exports.customPassword = () => {
  var password = "";
  var randomLength =
  Math.floor(Math.random() * (maxLength - minLength)) + minLength;
  password = generatePassword(randomLength, false, /[\w\d\?\-]/);
  return password;
};
