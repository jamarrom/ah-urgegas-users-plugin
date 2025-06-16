'use strict'
const { CLI, api } = require('actionhero')

module.exports = class CreateRole extends CLI {
  constructor () {
    super()
    this.name = 'create role'
    this.description = 'Create Default Role with no permissions'
    this.example = 'npx actionhero createRole --name[name] --code=[code] --description=[description] --scope=[system/owner] --access=[module/feature]'
    this.inputs = {
      name: { required: true },
      code: { required: true },
      description: { default: null },
      scope: { required: true },
      access: { required: true }
    }
  }

  async run ({response, params}) {
    const Role = api.mongooseModels.KwanUsers_Role;
    const SMF = api.mongooseModels.KwanUsers_SMF;

    const superRole = new Role();

    const access = params.access.split(',');

    superRole.roleName = params.name;
    superRole.roleDescription = params.description;
    superRole.roleCode = params.code;
    superRole.ownerScope = params.scope;
    for(let i=1;i<access.length;i++){
      superRole.access.push(access[i]);
    }

    let permArray = [];

    for (let i = 1; i < access.length; i++) {
      //Get the feature code from access
      let featureCode = access[i].split('/')[1];
      // Get the feature from DB
      let smf = await SMF.findOne({ featureCode: featureCode });
      for (let j = 0; j < smf.permissions.length; j++) {
        // Condition to prevent duplicated permission codes
        if (!permArray.includes(smf.permissions[j].code)) {
          permArray.push(smf.permissions[j].code);
        }
      }
    }
    permArray.push('GET_USER_ROLE')
    
    superRole.permissions = permArray;

    try{
      const superR = await superRole.save();

      console.log('Super Role Created');

    } catch(err) {
      if (err.code === 11000) {
        throw new Error('This Role already exists');
      }
      throw new Error('Error saving Role to database');
    }
    
  }
}
