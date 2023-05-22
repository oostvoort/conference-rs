REPO = oostvoort/conference-rs
TAG = latest

docker:
	docker compose up -d && docker compose logs -f

docker-build:
	docker build --progress=plain --rm --tag=$(REPO):$(TAG) -f ./Dockerfile .

docker-push:
	docker push $(REPO):$(TAG)


