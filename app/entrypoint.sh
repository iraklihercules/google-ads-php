
# Vendors from the Docker's build process will be replaced by the volumes, so we install them here.
composer install

# Keep the container running.
tail -f /dev/null
