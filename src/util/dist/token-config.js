/**
 * A module with the configuration for JSONWebTokens.
 * @module TokenConfiguration
 * @author [Carlos Gómez](https://gitlab.com/charlintosh)
 */
module.exports = {
    /**
     * Secret: the secret field to encode or decode a token.
     */
    secret: process.env.TOKSEC || "supersecret",
    /**
   * refreshTokenSecret: the secret field, but for resfresh tokens.
   */
  refreshTokenSecret: process.env.REFRESH || "supersecret",
  /**
   * tokenLife: The life of expiration date.
   */
  tokenLife: "1hr",
  /**
   * tokenLongestLife: The longest life that a token can live.
   */
  tokenLongestLife: "24h"
};
