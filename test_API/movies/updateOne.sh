curl \
-X PATCH \
-d @../data-movies/update.json \
-H "Authentication: bearer $(cat ../config/token.txt)" \
-H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/movies/$(cat ../config/id.txt)" \
-o res.log.json && cat res.log.json | jq "."
