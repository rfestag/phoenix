if [ $# -ne 2 ]
then
  echo "Usage: create-app.sh [name] [image]"
  exit 1
fi

NAME=$1
IMAGE=$2

mkdir -p $NAME
cp secrets/ca.* $NAME
cd $NAME
../secrets/create-secret.sh $NAME
kubectl apply -f $NAME-secret.yaml

echo "
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: $NAME
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $NAME
  template:
    metadata:
      labels:
        app: $NAME
    spec:
      containers:
      - name: $NAME
        image: $IMAGE
        ports:
        - containerPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: $NAME-svc
spec:
  ports:
  - port: 80
    targetPort: 8080
    protocol: TCP
    name: http
  selector:
    app: $NAME
---
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/force-ssl-redirect: \"true\"
    nginx.ingress.kubernetes.io/auth-tls-verify-client: \"optional\"
    nginx.ingress.kubernetes.io/auth-tls-secret: \"default/$NAME-tls\"
    nginx.ingress.kubernetes.io/auth-tls-verify-depth: \"3\"
    nginx.ingress.kubernetes.io/enable-cors: \"true\"
  name: $NAME-ingress
  namespace: default
spec:
  rules:
  - host: $NAME.local
    http:
      paths:
      - backend:
          serviceName: $NAME-svc
          servicePort: 80
        path: /
  tls:
  - hosts:
    - $NAME.local
    secretName: $NAME-tls
" > $NAME.yaml

kubectl apply -f $NAME.yaml
cd ..
