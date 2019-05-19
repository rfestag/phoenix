APP="phoenix"
STARTDIR="$PWD"
DIR=`dirname $0`
cd $DIR

#Reset Minikube
./reset.sh
if [ $? -eq 0 ]
then
  #Create/Apply secret
  ./create-secret.sh $APP
  kubectl apply -f $APP-secret.yaml
  
  #Build and deploy application
  cd ..
  ./scripts/update.sh
fi

cd $STARTDIR
