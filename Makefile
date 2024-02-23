
.PHONY:
start:
	docker compose up -d

.PHONY:
stop:
	docker compose stop


.PHONY:
build:
	docker compose build

.PHONY:
down:
	docker compose down

.PHONY:
shell:
	docker exec -it -u 1000:1000 google-ads-php-app bash

.PHONY:
shell-root:
	docker exec -it -u root google-ads-php-app bash
