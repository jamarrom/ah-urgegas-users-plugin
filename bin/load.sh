#!/bin/bash


if [ -z "$DB_URL" ]
  then
    db_url=mongodb://localhost:27017/mydb
  else
    db_url=$DB_URL
fi

echo "DB_URL=${db_url}"

if [ -z "$APP_AUTH" ]
  then
    echo 'Missing initial Admin password. Please run with ENV var APP_AUTH=<your_plain_admin_password>'
    exit 1
fi


curr_dir=`pwd`
trap 'catch' ERR
catch() {
  echo -e "\e[31mAn error ocurred, do you want to drop database and start again?\e[0m (y/N)\e[0m" 
  read CONF
    if [[ "$CONF" == 'y' ]]; then
    drop=`npx actionhero dropDb --db=${db_url}`
    [ $? -eq 0 ] && echo "Database deleted" || exit 1
    fi
}
#Admin system========================================================================================================
echo "CREATING ADMIN SYSTEM: DB_URL=${db_url}"
name="UrgeGas Administration Platform"
scode="ADMIN"
description="Software System used by UrgeGas personnel for the administration of the UrgeGas platform."
url="admin"
sys=`npx actionhero createSystem --name="${name}" --code="${scode}" --description="${description}" --url="${url}"`
[ $? -eq 0 ] && echo "System ${scode} created" || exit 1


#Admin modules-------------------------------------------------
# When adding a new module to the initializer, you must add the code, name and description to the respective arrays
# and increase the number of iterations on the for loop
declare -a mcode=('ADMIN_PROVIDERS' 'ADMIN_USERS' 'ADMIN_ROLES' 'ADMIN_REQUESTS' 'ADMIN_PLANS' 'ADMIN_DEVICE_TYPES' 'ADMIN_TANK' 'ADMIN_DEVICE')
declare -a mname=('Providers' 'Users' 'Roles' 'Requests' 'Plans' 'Device Types' 'Tank' 'Devices')
declare -a mdescription=('System module that manages UrgeGas Clients or \"providers\" which are usually gas companies' 
    'System module that manages UrgeGas Admin system users'
    'System module that manages access roles for UrgeGas Admin system users'
    'System module that manages sign-up requests from potential customers'
    'System module that manages the plans for the providers'
    'System module that manages the device types'
    'System module that manages the tanks'
    'System module that manages UrgeGas devices')
for i in {0..7}
    do
        mod=`npx actionhero createModule --system="${scode}" --code="${mcode[i]}" --name="${mname[i]}" --description="${mdescription[i]}"`
        [ $? -eq 0 ] && echo "Module ${mcode[i]} created" || exit 1


    done

#Admin owners --------------------------------------------------
ocode="MAIN"
oname="UrgeGas main franchise operator"
ourl="admin"
owner=`npx actionhero createOwner --system="${scode}" --code="${ocode}" --name="${oname}" --url="${ourl}"`
[ $? -eq 0 ] && echo "Owner ${ocode} created" || exit 1


#Admin features -------------------------------------------------
# Source: admin-features.csv
# Downloaded from: Catálogo de Sistemas, Modulos y permisos - ADMIN_FEATURES
# echo pwd
echo "CREATING ADMIN SYSTEM FEATURES"
INPUT="${curr_dir}/src/docs/admin-features.csv"
OLDIFS=$IFS
access=()
IFS=','
[ ! -f $INPUT ] && { echo "$INPUT file not found"; exit 99; }
while read systemCode moduleCode featureCode label permissionType permissionCode
do
    access=("${access[@]}"",${moduleCode}/${featureCode}")
    feat=`npx actionhero createFeature --system="${systemCode}" --module="${moduleCode}" --code="${featureCode}" --label="${label}" --permissionType="${permissionType}" --permissionCode="${permissionCode}"`
    [ $? -eq 0 ] && echo "Feature ${featureCode} created" || exit 1
done < $INPUT
IFS=$OLDIFS

#Admin Super Role --------------------------------------------------
echo "CREATING SUPER ROLE"
role=`npx actionhero createRole --name=SuperAdmin --code=ADMIN_Super --description="Super Role with all permissions" --scope=ADMIN/Main --access="${access}"`
[ $? -eq 0 ] && echo "Super role created" || exit 1


#Admin Super User
echo "CREATING SUPER USER"
user=`npx actionhero createSuperUser --username=Daniel --fname=Daniel --lname=Castañeda --email=daniel@kwantec.com --scope=ADMIN/Main --role=ADMIN_Super`
[ $? -eq 0 ] && echo "Super user created" || exit 1


#Client system=======================================================================================================
echo "CREATING CLIENT SYSTEM"
name="UrgeGas Clients Web Application"
scode="CLIENT"
description="Software System used by UrgeGas customers (Gas companies) to manage their UrgeGas devices, customers, routes, etc"
url="clients"
sys=`npx actionhero createSystem --name="${name}" --code="${scode}" --description="${description}" --url="${url}"`
[ $? -eq 0 ] && echo "System ${scode} created" || exit 1

#Client modules-------------------------------------------------
# When adding a new module to the initializer, you must add the code, name and description to the respective arrays
# and increase the number of iterations on the for loop
declare -a mcode=('CLIENT_REPORTS' 'CLIENT_ORDERS' 'CLIENT_BRANCHES' 'CLIENT_EMPLOYEES' 'CLIENT_ROLES' 'CLIENT_CLIENT' 'CLIENT_DEVICE' 'CLIENT_PROVIDER_PROFILE')
declare -a mname=('Reports' 'Orders' 'Branches' 'Employees' 'Roles' 'Clients' 'Devices' 'Company')
declare -a mdescription=('System module for UrgeGas-Providers urers can get reports'
    'System module to manage UrgeGas-provider gas orders'
    'System module to manage UrgeGas-provider branches'
    'System module that manages UrgeGas client system employees' 
    'System module that manages access roles for UrgeGasClient sustem roles'
    'System module that managesUrgeGas Client system potencial clients'
    'System module that manages UgeGas clients devices'
    'System module that displays the company profile')
for i in {0..7}
    do
        mod=`npx actionhero createModule --system="${scode}" --code="${mcode[i]}" --name="${mname[i]}" --description="${mdescription[i]}"`
        [ $? -eq 0 ] && echo "Module ${mcode[i]} created" || exit 1

    done

#Client owners ---------------------------------------------------------------------
ocode="DEMO"
oname="UrgeGas Client Demo login"
ourl="demo"
owner=`npx actionhero createOwner --system="${scode}" --code="${ocode}" --name="${oname}" --url="${ourl}"`
[ $? -eq 0 ] && echo "Owner ${ocode} created" || exit 1

#Client features -------------------------------------------------
# Source: client-features.csv
# Downloaded from: Catálogo de Sistemas, Modulos y permisos - CLIENT
# 
INPUT="${curr_dir}/src/docs/client-features.csv"
OLDIFS=$IFS
access=()
IFS=','
[ ! -f $INPUT ] && { echo "$INPUT file not found"; exit 99; }
while read systemCode moduleCode featureCode label permissionType permissionCode
do
    access=("${access[@]}"",${moduleCode}/${featureCode}")
    feat=`npx actionhero createFeature --system="${systemCode}" --module="${moduleCode}" --code="${featureCode}" --label="${label}" --permissionType="${permissionType}" --permissionCode="${permissionCode}"`
    [ $? -eq 0 ] && echo "Feature ${featureCode} created" || exit 1
done < $INPUT
IFS=$OLDIFS

#Client Super Role --------------------------------------------------
role=`npx actionhero createRole --name=SuperClient --code=CLIENT_Super --description="Super Role with all permissions" --scope=CLIENT/Demo --access="${access}"`
[ $? -eq 0 ] && echo "Super role created" || exit 1

#Client Super User
user=`npx actionhero createSuperUser --username=client --fname=Client --lname=Demo --email=client@kwantec.com --scope=CLIENT/Demo --role=CLIENT_Super`
[ $? -eq 0 ] && echo "Super user created" || exit 1
