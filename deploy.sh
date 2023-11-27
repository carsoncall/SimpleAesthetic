#!/bin/bash

while getopts k:h:s: flag
do
    case "${flag}" in
        k) key=${OPTARG};;
        h) hostname=${OPTARG};;
        s) service=${OPTARG};;
    esac
done

if [[ -z "$key" || -z "$hostname" || -z "$service" ]]; then
    printf "\nMissing required parameter.\n"
    printf "  syntax: deployFiles.sh -k <pem key file> -h <hostname> -s <service>\n\n"
    exit 1
fi

printf "\n----> Deploying files for $service to $hostname with $key\n"

# Step 1
printf "\n----> Clear out the previous distribution on the target.\n"
ssh -i "$key" ubuntu@$hostname << ENDSSH
rm  services/${service}/public/*
rm services/${service}/*.js
rm services/${service}/*.json
ENDSSH

# Step 2
printf "\n----> Copy the distribution package to the target.\n"
scp -i "$key" public/* ubuntu@$hostname:services/$service/public
scp -i "$key" *.js ubuntu@$hostname:services/$service/
scp -i "$key" *.json ubuntu@$hostname:services/$service/
