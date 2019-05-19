if [ $# -ne 1 ]
then
  echo "Usage: create-client.sh [name]"
  exit 1
fi
# Generate the Client Key, and Certificate and Sign with the CA Certificate
openssl req -new -newkey rsa:4096 -keyout $1.key -out $1.csr -nodes -subj "/CN=$1"
openssl x509 -req -sha256 -days 365 -in $1.csr -CA ca.crt -CAkey ca.key -set_serial 02 -out $1.crt
