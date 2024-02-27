# Google Ads Testing

This project is created to test requests and scripts for Google Ads API.

### Requirements:
* Docker
* Docker Compose
* Make

### How to use:

1. Copy `app/src/google_ads_php.example.ini` to `app/src/google_ads_php.ini` and update the credentials. See [this guide](https://github.com/googleads/google-ads-php) for more.


2. Access the Docker container and run scripts:
```bash
make build  # Build the container
make start  # Run the container
make shell  # Access the container

# Change directory to examples
cd scripts/

# Run scripts with PHP
php {script_name}.php
```

3. To stop or delete the container, use:
```bash
make stop  # Stops the container
make down  # Deletes the container
```

See the Google Ads Query Language documentation [here](https://developers.google.com/google-ads/api/docs/query/overview).
