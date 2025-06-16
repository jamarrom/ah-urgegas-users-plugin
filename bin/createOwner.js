'use strict'
const { CLI, api } = require('actionhero')

module.exports = class CreateOwner extends CLI {
  constructor () {
    super()
    this.name = 'create owner'
    this.description = 'Add an owner to the system'
    this.example = 'npx actionhero createOwner --system=[system] --code=[code] --name=[name] --url=[url]'
    this.inputs = {
      system: { required: true },
      code: { required: true },
      name: {required: true },
      url: { required: true }
    }
  }

  async run ({response, params}) {
    const System = api.mongooseModels.KwanUsers_System;
    
    try {
      const system = await System.findOne({code:params.system});
      if(!system){
        throw new Error('System not found');
      }

      system.owners.push({
        ownerCode: params.code,
        ownerStatus: 'ACTIVE',
        ownerName: params.name,
        ownerURL: params.url
      })

      await system.save();

    } catch(err){
      throw new Error(`Failed to create owner${params.code}`)
    }
  }
}
