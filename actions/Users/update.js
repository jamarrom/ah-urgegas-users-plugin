"use strict";
const { Action, api } = require("actionhero");
const cloudinary = require("cloudinary").v2;
const jwt = require("jsonwebtoken");
const { tokenConfig } = require("../../index");
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDKEY,
  api_secret: process.env.CLOUDSECRET
});

module.exports = class KwanUsers_UpdateAdminUser extends Action {
  constructor() {
    super();
    this.name = "users:update";
    this.middleware = ["hasOwnerScope"];
    this.description = "Update user information.";
    this.permission = 'PUT_USER'
    //required
    this.inputs = {
      _id: { required: true }
    };
  }

  async run(data) {
    //required
    const p = data.connection.params;
    const doc = await api.KwanPlugin.update({
      model: 'KwanUsers_User',
      values: p
    });

    data.response = doc;
  }
};
