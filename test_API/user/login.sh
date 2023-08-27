curl \
  -X POST \
  -d @../data-users/login.json \
  -H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/users/login" \
  -o res.log.json \
  && cat res.log.json  | jq "."  && node ./read_and_write.js
  
