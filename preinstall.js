const fs = require("fs");
fs.writeFile("./read-with-me-auth-credentials.json", process.env.google_config, (err) => {if (!err) {console.log("Preinstall complete")} else console.log(err)});