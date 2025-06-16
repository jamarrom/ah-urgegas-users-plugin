'use strict'
const { CLI, api } = require('actionhero')

module.exports = class CreateSystem extends CLI {
  constructor () {
    super()
    this.name = 'create system'
    this.description = 'Load a system with one module'
    this.example = 'npx actionhero createSystem --name=[name] --code=[code] --description=[SomeDescription] --url=[admin]'
    this.inputs = {
      name: { required: true },
      code: { required: true },
      description: { default: 'A system for urgegas'},
      url: { required: true }
    }
  }

  async run ({response,params}) {
    const System = api.mongooseModels.KwanUsers_System;

    const newSystem = new System();

    newSystem.code = params.code;
    newSystem.name = params.name;
    newSystem.description = params.description;
    newSystem.url = params.url;

    try {
      const savedSystem = await newSystem.save();
    } catch(err) {
      if (err.code === 11000) {
        throw new Error('This system already exists');
      }
      throw new Error(`Error creating system ${params.code}`)
    }
  }
}
