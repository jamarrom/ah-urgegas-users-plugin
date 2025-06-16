const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");
const mongooseLeanVirtuals = require("mongoose-lean-virtuals");

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  password: { type: String },
  temporalPassword: { type: String, default: null },
  verified: { type: Boolean, default: false },
  avatarUrl: {
    type: String,
    default:
      "images/default.jpg"
  },
  status: { type: String, default: "active" },
  scope: [
    {
      scopeName: {
        type: String
      },
      roleCode: {
        type: String,
        required: true
      },
      scopeInfo: {
        type: String
      }
    }
  ]
});

userSchema.virtual("fullName").get(function() {
  return this.firstName + " " + this.lastName;
});

userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseLeanVirtuals);

module.exports = userSchema;

/*
const userSchema = new Schema({
  username: It's possible to login using this username,
  email: the user's email,
  firstName: the user's first name,
  lastName: the user's last name,
  password: the user's encrypted password,
  temporalPassword: temporary password until a user is prompted to change their password,
  verified: (BOOLEAN) whether the user has been verified by an UrgeGas Admin,
  avatarUrl: a default user icon,
  status: this field can be 'ACTIVE' or 'SUSPENDED', depending on the value, the user will or won't be able to Log In.
  scope: [
    An example of a scope is CLIENT/GasBros, this specific scope is the CLIENT system for the GasBros company. A user may belong to another scope as well,
    such as CLIENT/Gas-Z.
    {
      scopeName: the scope name,
      roleCode: this is the user's role in this scope,
      scopeInfo: additional information about the scope, not required
    }
  ]
});
*/
