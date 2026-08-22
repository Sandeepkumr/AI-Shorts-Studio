import { drizzle } from "drizzle-orm/node-postgres";

import { database } from "../config/database.js";
import * as schema from "./schema.js";

export const db = drizzle(database, { schema });