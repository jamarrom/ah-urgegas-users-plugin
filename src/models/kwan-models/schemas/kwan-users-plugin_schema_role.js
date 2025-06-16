const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const RoleSchema = new Schema({
  roleName: { type: String, required: true },
  roleDescription: { type: String },
  roleCode: { type: String, required: true, unique: true },
  ownerScope: { type: String, required: true },
  access: [{ type: String, required: true }],
  permissions: [{ type: String, required: true }]
});

RoleSchema.plugin(mongoosePaginate);

module.exports = RoleSchema;

/*
const RoleSchema = new Schema({
  roleName: the name for the role,
  roleDescription: a description for the role,
  roleCode: is composed of the system name + _ + role name,
  ownerScope: the scope of the owner, for example, 'CLIENT/Demo', where 'CLIENT' is the system name
  and 'Demo' is the Gas Company name,
  access: a list of modules that a this role has access to,
  permissions: a list of permissions that this role has, this is to access the specific features
});
*/
