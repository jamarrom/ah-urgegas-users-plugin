# DOCUMENTATION: KWAN System-Model-Features Plugin.

ActionHero plugin for users for contributing MongoDB and Mongoose.

# System

A system is defined as a set of modules. The only systems currently supported are 'ADMIN' and 'CLIENT'.

# Modules

Modules are defined as a set of features.

# Features

Features are collections of available UI components that are linked to Backend end Web services, such as Creating a New Employee. The visual component `AddEmployee` button is linked to a web service that might be called `CreateNewEmployee`.

FEATURE: { `ADDEMPLOYEE`(Front) --> `CREATENEWEMPLOYEE`(Back) },

# User

A user contains basic user information, as well as a `SCOPE`.
A SCOPE is defined as { SCOPENAME, ROLECODE, SCOPEINFO }
A SCOPE is an Array of Scopes that determine which Systems that user has access to. A user may belong to more than one System.

For example, a `Driver` might work for Gas Company 1 and Gas Company 2.
Or, a `SalesRepresentative` might work for 2 Gas Companies as well.

Inside those Systems, he might have different Roles. He may be a SalesRepresentative in one Gas Company and a Driver in another. Therefore, we need to include a `ROLECODE` inside the SCOPE property that determines the users role on a specific System. ROLECODE is linked to the ROLES schema. `SCOPEINFO` is defined as any additional information the Gas Company may want to store about their employees such as: Employee Rating, Deliveries made, Monthly sales average, etc.

# Roles

Roles are different groups of `ACCESS` and `PERMISSIONS` that a user might have. ACCESS reflects the users UI components, and PERMISSIONS reflect the backend services that user is allowed to consume. The `OWNERSCOPE` property defines the System that this role belongs to. For example, 2 Gas Companies may have the same Role EmployeeManager and each of them is free to select what ACCESS and PERMISSIONS that `EmployeeManager` might have. In one Gas Company, EmployeeManager might only have access to the `editemployee` in the backend while at another Gas Company that same role may have access to editemployee and `deleteemployee` in the backend. Therefore, roleName may not be unique however roleCode is. roleCode is composed of `SCOPENAME` appended with `ROLENAME` so that is is easily accessed by the User Schema.
