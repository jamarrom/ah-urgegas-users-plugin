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
    this.name = "users:update:rol";
    this.middleware = ["hasOwnerScope"];
    this.description = "Update rol of user";
    this.inputs = {
      roleCode: { required: true },
      employeeEmail: { required: true }
    };
  }

  async run(data) {
    console.log('ENTRA A ACTUALIZAR EL ROL')

    const User = api.mongooseModels.KwanUsers_User
    const p = data.connection.params;
    let { ownerScope, _id} = data.session

    try {
      // console.log('nuevo roleCode: ', p.roleCode)
      let user = await User.find({email: p.employeeEmail})
      if (user && user.length === 1) {
        user = user[0]
        user.scope[0].roleCode = p.roleCode
        await user.save(err => console.log('Error en save', err))
        data.response = {msg: 'Role updated'};
      } else {
        throw Error('Error getting employee to update role')
      }
      // console.log('el scope:', user.scope)

      // const loco = await User.update(
      //   { _id: _id },
      //   { $set: {
      //     "scope.$[0].roleCode": p.roleCode
      //     }
      //   }
      // )
    } catch(e) {
      console.log('Error updating ROLE')
      console.log(e)
      data.response = {error: 'Error updating role'}
    }

  }
};