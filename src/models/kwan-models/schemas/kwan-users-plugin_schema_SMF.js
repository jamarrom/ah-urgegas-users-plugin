const mongoose = require("mongoose");
const { Schema } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const SMFSchema = new Schema({
  systemId: {
    type: Schema.Types.ObjectId,
    ref: "System",
    required: true
  },
  moduleCode: {
    type: String,
    required: true
  },
  featureCode: {
    type: String,
    required: true,
    unique: true
  },
  featureLabel: {
    type: String
  },
  permissions: [
    {
      permissionType: {
        type: String,
        required: true
      },
      code: {
        type: String,
        required: true
      }
    }
  ]
});

SMFSchema.plugin(mongoosePaginate);

module.exports = SMFSchema;

/*
const SMFSchema = new Schema({
  systemId: the MONGO ID assigned to the System that this feature belongs to,
  moduleCode: the module code that this feature belongs to,
  featureCode: it is composed of the moduleCode + _(feature), for example: ADMIN_PROVIDER_LIST,
  featureLabel: the label that the respective UI element contains,
  permissions: [
    These are the required permissions a user must have to be allowed to access this feature both in the front
    end and the back end
    {
      permissionType: if it a web service this value is 'WS', if it is a UI component this value 'UI',
      code: if permissionType's value is 'WS' this value is in the format 'GET_PROVIDER_LIST' where 'GET'
      is the REST service and PROVIDER_LIST is the feature code minus the system name. If permissionType's
      value is 'UI' this value is in the format 'ADMIN_PROVIDER_LIST_ACCESS' where 'ADMIN_PROVIDER' is the
      module name and LIST_ACCESS is a descriptive feature name.
    }
  ]
});*/
