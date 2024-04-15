all: login deploy

login:
	docker login europe-west1-docker.pkg.dev/deepomatic-160015/docker-main/

deploy:
	VERSION=$$(jq -r ".version" "package.json") skaffold run --kube-context=main-staging --kubeconfig ~/.kube/config --namespace=connector-demo
