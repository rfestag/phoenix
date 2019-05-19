if [ $# -ne 1 ]
then
  echo "Usage: create-secret.sh [name]"
  exit 1
fi
# Generate the Server Key, and Certificate and Sign with the CA Certificate
openssl req -new -newkey rsa:4096 -keyout $1.key -out $1.csr -nodes -subj "/CN=$1.local"
openssl x509 -req -sha256 -days 365 -in $1.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out $1.crt

#Create a file we can use to apply the config
kubectl create secret generic $1-tls --from-file=tls.crt=$1.crt --from-file=tls.key=$1.key --from-file=ca.crt=ca.crt --dry-run -o yaml > $1-secret.yaml
