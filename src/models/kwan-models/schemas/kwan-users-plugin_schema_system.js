const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const systemSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  modules: [
    {
      moduleCode: {
        type: String,
        required: true,
        unique: true
      },
      moduleName: {
        type: String
      },
      moduleDescription: {
        type: String
      }
    }
  ],
  owners: [
    {
      ownerCode: {
        type: String,
        required: true,
        unique: true
      },
      ownerStatus: {
        type: String,
        default: "active"
      },
      ownerName: {
        type: String
      },
      ownerURL: {
        type: String
      },
      ownerTag: {
        type: String
      },
      ownerImage: {
        type: String
      }
    }
  ]
});

systemSchema.plugin(mongoosePaginate);

module.exports = systemSchema;

/*
const systemSchema = new Schema({
  code: currently there are only 2 systems, CLIENT and ADMIN, these are created when the system is launched,
  name: the name of a system,
  description: a description of the system,
  url: currently only supports the values 'client' and 'admin',
  modules: [
    A collection of features. An example would be 'ADMIN_PROVIDERS' module or 'CLIENT_EMPLOYEES'.
    {
      moduleCode: an example is  'ADMIN_PROVIDERS' where 'ADMIN' is the system name and 'PROVIDERS' is the module name,
      moduleName: the module name,
      moduleDescription: a module's description
    }
  ],
  owners: [
    Owners are the gas companies who own these modules.
    {
      ownerCode: the name of the Gas Company,
      ownerStatus: the status of the owner, supported values are 'ACTIVE' and 'SUSPENDED',
      ownerName: the name of the owner,
      ownerURL: the url is the Gas Company's name but in lowercase,
      ownerTag: an optional tag to identify an owner more easily,
      ownerImage: not supported at the moment,
    }
  ]
});
*/
