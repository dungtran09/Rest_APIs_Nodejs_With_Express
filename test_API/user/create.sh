curl \
  -X POST \
  -d @../data-users/create.json \
  -H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/users/signup" \
  -o res.log.json && cat res.log.json | jq "."
