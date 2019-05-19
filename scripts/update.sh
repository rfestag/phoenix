APP="phoenix"
STARTDIR="$PWD"
DIR=`dirname $0`
cd $DIR/..

eval $(minikube docker-env)
env | grep DOCKER
docker build -t phoenix:v1 .
#sudo docker build -t localhost:5000/phoenix/web .
#sudo docker push localhost:5000/phoenix/web

kubectl apply -f deploy/dev.yaml
#Hack to force reload if dev.yaml hasn't changed
kubectl patch deployment $APP -p "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"`date +'%s'`\"}}}}}"

eval $(minikube docker-env -u)
env | grep DOCKER
cd $STARTDIR
