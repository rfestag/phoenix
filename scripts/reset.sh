DIR=`dirname $0`
$DIR/create-ca.sh
$DIR/create-client.sh $USER

if ! [ -x "$(command -v minikube)" ]; then
  echo 'Error: minikube is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v kubectl)" ]; then
  echo 'Error: kubectl is not installed.' >&2
  exit 1
fi
if ! [ -x "$(command -v helm)" ]; then
  echo 'Error: helm is not installed.' >&2
  exit 1
fi

minikube delete
minikube start --vm-driver kvm2
minikube addons enable ingress
kubectl apply -f $DIR/clusterrole.yaml
kubectl create serviceaccount -n kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
#kubectl create -f kube-registry.yaml
#kubectl port-forward --namespace kube-system $(kubectl get po -n kube-system | grep kube-registry-v0 | \awk '{print $1;}') 5000:5000
helm init --upgrade --service-account tiller
kubectl --namespace kube-system get pods | grep tiller
