openssl genrsa -out ./emi/private.pem 1024
openssl req -new -key ./emi/private.pem -out ./emi/csr.pem  -subj \
"/C=CN/ST=Beijing/L=Beijing/O=emi/OU=fe/CN=imvvk"

openssl x509 -req -days 365 -sha1 -extensions v3_ca -signkey \
./emi/private.pem -in ./emi/csr.pem -out ./emi/ca.cer

