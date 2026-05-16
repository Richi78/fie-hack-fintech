import "dotenv/config";
import { DEFAULTS } from "./config.js";
import app from "./app.js";

app.listen(DEFAULTS.PORT, () => {
  console.log("Server is running on port " + DEFAULTS.PORT);
});
