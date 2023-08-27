curl \
-X POST \
-d @../data-movies/create.json \
-H "Authentication: bearer $(cat ../config/token.txt)" \
-H "Content-Type: application/json" "$(cat ../config/url.txt)/api/v1/movies" \
-o res.log.json && cat res.log.json | jq "."
