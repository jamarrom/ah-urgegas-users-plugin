'use strict'
const { CLI, api } = require('actionhero')

module.exports = class CreateFeature extends CLI {
  constructor() {
    super()
    this.name = 'create feature'
    this.description = 'Create a feature for the module'
    this.example = 'npx actionhero createFeature --system=[systemCode] --module=[moduleCode] --code=[featureCode] --label=[VisibleName] --permissionType=[type1-type2] --permissionCode=[code1-code2]'
    this.inputs = {
      system: { required: true },
      module: { required: true },
      code: { required: true },
      label: { required: true },
      permissionType: { required: true },
      permissionCode: { required: true }
    }
  }

  async run({ response, params }) {
    const System = api.mongooseModels.KwanUsers_System;
    const SMF = api.mongooseModels.KwanUsers_SMF;
    const newFeature = new SMF();

    const system = await System.findOne({ code: params.system });
    if (!system) {
      throw new Error('System not found');
    }

    const type = params.permissionType.split('-');
    const code = params.permissionCode.split('-');
    if (type.length !== code.length) {
      throw new Error("Type or Code missing");
    }

    for (let i = code.length; i >= 0; i--) {
      if (code[i] === '') {
        code.splice(i, 1);
        type.splice(i, 1);
      }
    }
    console.log(code.length);
    if (code.length > 0) {
      newFeature.systemId = system._id;
      newFeature.moduleCode = params.module;
      newFeature.featureCode = params.code;
      newFeature.featureLabel = params.label;
      for (let i = 0; i < type.length; i++) {
        newFeature.permissions.push({
          permissionType: type[i],
          code: code[i]
        })
      }

      try {
        const savedFeature = await newFeature.save();
        console.log('Saved SMF');
      } catch (err) {
        console.log(err);
        if (err.code === 11000) {
          throw new Error('A Feature with that name already exists');
        }
        throw new Error('Error saving feature to database');
      }
    }
  }
}
