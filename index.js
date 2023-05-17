import express from "express";
import sql from "mssql";
import config from "./config/config.js";
import route from "./routes/router.js";

const app = express();
const port = 3030;
app.use(express.json());


// SQL server koneksi
sql.connect(config, (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Koneksi Database Berhasil");
  }
});
// SQL server koneksi end

app.use('/',route);

app.listen(port, () => {
  console.log(`Server Connection on ${port}`);
});
