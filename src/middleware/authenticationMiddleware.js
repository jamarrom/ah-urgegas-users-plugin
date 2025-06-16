const jwt = require("jsonwebtoken");
const { tokenConfig } = require("../util/plugin-util");

module.exports = {
  name: "authenticationMiddleware",
  global: false,
  priority: 1000,
  preProcessor: async (data) => {
    const token = data.params.token;
    const refreshToken = data.params.refreshToken;

    if (!token) {
      throw new Error("No authenticated.");
    }

    if (!refreshToken) {
      throw new Error("No refresh token provided.");
    }
    try {
      jwt.verify(token, tokenConfig.secret, {ignoreExpiration: true});
    } catch (e) {
      console.log(e);
      throw new Error("Token invalid.");
    }
    try {
      jwt.verify(refreshToken, tokenConfig.secret,);
    } catch (e) {
      throw new Error("Token invalid.");
    }
  }
};