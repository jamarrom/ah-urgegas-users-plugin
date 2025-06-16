'use strict'
const { CLI, api } = require('actionhero')

module.exports = class CreateModule extends CLI {
  constructor () {
    super()
    this.name = 'create module'
    this.description = 'Add a module to the system'
    this.example = 'npx actionhero createModule --system=[systemCode] --code=[moduleCode] --name=[ModuleName] --description=[description]'
    this.inputs = {
      system: { required: true },
      code: {required: true },
      name: { required: true },
      description: { default: 'Module of system'}
    }
  }

  async run ({response, params}) {
    const System = api.mongooseModels.KwanUsers_System;
    
    try {
      const system = await System.findOne({code:params.system});
      if(!system){
        throw new Error('System not found');
      }

      system.modules.push({
        moduleCode: params.code,
        moduleName: params.name,
        moduleDescription: params.description
      })

      await system.save();  

    } catch (err){
      throw new Error(`Failed to load ${params.code} module`)
    }
  }
}
