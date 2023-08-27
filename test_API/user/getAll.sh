curl \
  -X GET \
  -H "Authotication: bearer $(cat ../movies/token.txt)" \
  -H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/users/" \
  -o res.log.json && cat res.log.json | jq "." 
