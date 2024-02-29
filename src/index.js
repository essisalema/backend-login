import app from "./app.js";
import { connnectDB } from "./db.js";


connnectDB();
app.listen(3000);
console.log('Server on port', 3000)