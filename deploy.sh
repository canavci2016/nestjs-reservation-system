#!/bin/bash

# Exit immediately if a command fails
set -e


if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found!"
  exit 1
fi

# Build project
echo "Running yarn build..."
yarn build

# Zip output
echo "Creating output.zip..."
zip -r output.zip .

# Deploy using Elastic Beanstalk
echo "Deploying to Elastic Beanstalk..."
eb deploy

echo "Deployment completed successfully."
