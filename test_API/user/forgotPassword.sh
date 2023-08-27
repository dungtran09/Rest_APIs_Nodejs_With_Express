curl \
-X POST \
-d @../data-users/email.json \
-H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/users/forgotPassword" \
-o res.log.json && cat res.log.json  | jq "."
