'use strict'
const { CLI, api } = require('actionhero');
const bcrypt = require("bcryptjs");

module.exports = class CreateSuperUser extends CLI {
  constructor () {
    super()
    this.name = 'create super user'
    this.description = 'Create Urge Gas Super User'
    this.example = 'npx actionhero createSuperUser --username=[username] --fname=[firstName] --lname=[lastName] --email=[email] --scope=[scope] --role=[roleCode]'
    this.inputs = {
      username: {required: true },
      email: {required: true },
      scope: { required: true },
      fname: { required: true },
      lname: { required: true },
      role: { required: true }
    }
  }

  async run ({params}) {
    const User = api.mongooseModels.KwanUsers_User;
    console.log(params);

    const superUser = new User();

    const password = await bcrypt.hash(process.env.APP_AUTH, 12);
    
    superUser.username = params.username;
    superUser.verified = true;
    superUser.email = params.email;
    superUser.firstName = params.fname;
    superUser.lastName = params.lname;
    superUser.avatarUrl = 'images/user_default.jpg'
    superUser.password = password;
    superUser.scope.push({
      scopeName: params.scope,
      scopeInfo: null,
      roleCode: params.role
    })

    try {
      const result = await superUser.save();
    } catch(err){
      if (err.code === 11000) {
        throw new Error('That user already exists');
      }
      throw new Error("Error saving new user to database");
    }
  }
}
