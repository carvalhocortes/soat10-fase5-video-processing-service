#!/bin/bash

# Load AWS credentials from ~/.aws/credentials
export $(awk '/\[default\]/{flag=1;next}/\[/{flag=0}flag && NF' ~/.aws/credentials | sed 's/ = /=/g')
gh secret set AWS_ACCESS_KEY_ID -b"$aws_access_key_id"
gh secret set AWS_SECRET_ACCESS_KEY -b"$aws_secret_access_key"

# Load environment variables from .env file
export $(grep -v '^\s*#' ./.env | grep -E '^\s*[A-Za-z_][A-Za-z0-9_]*\s*=' | sed 's/ = /=/g')

gh secret set AWS_REGION -b"$AWS_REGION"
