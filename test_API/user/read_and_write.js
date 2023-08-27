const fs = require("fs");

try {
  const data = JSON.parse(fs.readFileSync("./res.log.json", "utf-8"));
  fs.writeFileSync("../config/token.txt", data.token);
  console.log(`Write token "${data.token}" successfully!`);
} catch (error) {
  console.log(error.message);
}
