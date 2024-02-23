# Composer layer
# ----------------------
FROM composer:latest AS composer


# PHP layer
# ----------------------
FROM php:8.2

ARG NON_PRIVILEGED_USER_NAME="superstar"

# Import Composer from the previous layer
COPY --from=composer /usr/bin/composer /usr/bin/composer

# Required for Composer install
RUN apt update -qqy \
    && apt upgrade -qqy \
    && apt install wget curl zip unzip git -qqy

# Install PHP extensions
RUN docker-php-ext-install bcmath

# Install TZ data required by PHP
RUN apt install -yq tzdata \
    && ln -fs /usr/share/zoneinfo/Europe/Madrid /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata
ENV TZ="Europe/Madrid"

# Create non-privileged user
RUN groupadd --gid 1000 ${NON_PRIVILEGED_USER_NAME} \
    && useradd ${NON_PRIVILEGED_USER_NAME} --create-home --uid 1000 --gid 1000 --shell /bin/bash \
    && usermod --append --groups www-data ${NON_PRIVILEGED_USER_NAME} \
    && echo 'alias ll="ls -al"' >> /root/.bashrc \
    && echo 'alias ll="ls -al"' >> /home/${NON_PRIVILEGED_USER_NAME}/.bashrc

# Copy project source
WORKDIR /var/www/html
COPY --chown=${NON_PRIVILEGED_USER_NAME}:www-data src .

# Run Composer install with the non-privileged user
COPY --chown=${NON_PRIVILEGED_USER_NAME}:www-data entrypoint.sh /bin/entrypoint
RUN chmod +x /bin/entrypoint
USER ${NON_PRIVILEGED_USER_NAME}
CMD /bin/entrypoint
