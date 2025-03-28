import { PgHandler } from "../components/pgHandler.js";
import querys from '../config/querys.json' assert { type: "json" };
import dbd from '../config/dbd.json' assert { type: "json" };

export const componentesDB = new PgHandler({config: dbd, querys, allowTransactions: true});