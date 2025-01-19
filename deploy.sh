#!/bin/bash

# Check if npm is installed
while getopts h:s:d: flag
do
    case "${flag}" in
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
        d) devcontainer=${OPTARG};;
    esac
done

if [[ -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployFiles.sh -h <hostname> -s <service> [-d <devcontainer>]\n\n"
    exit 1
fi

printf "\n----> Deploying files for $service to $hostname\n"

# Step 1
if [[ -n "$devcontainer" ]]; then
    printf "\n----> Build the distribution package on the remote devcontainer\n"
    ssh $devcontainer << 'ENDSSH'
        rm -rf /workspaces/simpleaesthetic/build
        mkdir /workspaces/simpleaesthetic/build
        cd /workspaces/simpleaesthetic
        npm install
        npm run build
        cp -rf dist /workspaces/simpleaesthetic/build/public
        cp service/*.cjs /workspaces/simpleaesthetic/build
        cp service/*.json /workspaces/simpleaesthetic/build
ENDSSH

else
    if ! command -v npm &> /dev/null
    then
        echo "NPM not found. Do you need to perform this action in a container?"
        exit 1
    fi

    printf "\n----> Build the distribution package\n"
    rm -rf build
    mkdir build
    npm install # make sure vite is installed so that we can bundle
    npm run build # build the React front end
    cp -rf dist build/public # move the React front end to the target distribution
    cp service/*.cjs build # move the back end service to the target distribution
    cp service/*.json build
fi

echo "Done building, now to copy it "
pwd

# Step 2
printf "\n----> Clear out the previous distribution on the target.\n"
ssh -v root@$hostname << ENDSSH
rm -rf services/${service}
mkdir -p services/${service}
ENDSSH

# Step 3
printf "\n----> Copy the distribution package to the target.\n"
scp -r build/* root@$hostname:services/$service/
scp -r package.json root@$hostname:services/$service/

# Step 4
printf "\n----> Deploy the service on the target\n"
ssh root@$hostname << ENDSSH
cd services/${service}
npm install
systemctl restart ${service}
ENDSSH

# Step 5
printf "\n----> Removing local copy of the distribution package\n"
rm -rf build

printf "\n----> Deployment complete.\n\n"
