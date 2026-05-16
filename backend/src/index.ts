// Side-effect import: loads .env DURING import evaluation (before other modules)
import "dotenv/config";
import { DEFAULTS } from "./config.js";
import app from "./app.js";

app.listen(DEFAULTS.PORT, () => {
  console.log(`Server running on port ${DEFAULTS.PORT}`);
  console.log(`Base URL: ${DEFAULTS.BASE_URL}`);
});
