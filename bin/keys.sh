#!/bin/bash

read -e -p "SendGrid Key: " sg_key
echo -e "SG_KEY=${sg_key}" >> ../../../.env

read -e -p "Enter backend host url (example: https://backend.example.com:3000 ): " -i "http://localhost:3000" domain
echo -e "DOMAIN=${domain}" >> ../../../.env
