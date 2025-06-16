'use strict'
const { Action, api } = require('actionhero')

module.exports = class DeleteRole extends Action {
    constructor() {
        super()
        this.name = 'role:delete'
        this.description = 'deletes a role'
        this.middleware = ["hasOwnerScope"];
        this.permission = 'DELETE_ROLE'
        this.inputs = {
            // _id: { required: true }
        }
    }

    async run(data) {
        const p = data.connection.params;
        const roleModel = api.mongooseModels.KwanUsers_Role;
        const userModel = api.mongooseModels.KwanUsers_User;

        const defaultUserRole = "CLIENT_Super";

        //get the role model
        const role = await roleModel.findById(p.payload)

        //Check if the role is the 'default' user rol, in this case "CLIENT_Super"
        if(role && role.roleCode === defaultUserRole)
        {
            data.response = {success: false, msg: 'This role cannot be deleted'}
            return;
        }
        //check if any user had asigned the role
        const users = await userModel.find({ "scope.roleCode": role.roleCode})
        if (users.length === 0){
            const doc = await api.KwanPlugin.delete({
                model: 'KwanUsers_Role',
                value: p.payload,
                column: '_id',
            })
            data.response = {success: true, msg: 'Role deleted successfully'};
        }
        else
            data.response = {success: false, msg: 'The role cannot be deleted because it is assigned to one or more users in the system'}
    }
}