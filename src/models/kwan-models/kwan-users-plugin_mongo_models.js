"use strict";
const mongoose = require("mongoose");

const UserSchema = require("./schemas/kwan-users-plugin_schema_users");
const SystemSchema = require("./schemas/kwan-users-plugin_schema_system");
const RoleSchema = require("./schemas/kwan-users-plugin_schema_role");
const FeatureSchema = require("./schemas/kwan-users-plugin_schema_SMF");

exports.User = mongoose.model("User", UserSchema);
exports.System = mongoose.model("System", SystemSchema);
exports.Role = mongoose.model("Role", RoleSchema);
exports.Feature = mongoose.model("Feature", FeatureSchema);