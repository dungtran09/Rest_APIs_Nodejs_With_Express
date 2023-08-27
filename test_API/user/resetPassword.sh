curl \
-X PATCH \
-d @../data-users/reset_password.json \
-H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/users/resetPassword/$(cat ../config/token_reset_password.txt)" \
-o res.log.json && cat res.log.json  | jq "."
