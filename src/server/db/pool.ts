import * as pg from "pg"
pg.types.setTypeParser(20, function (value) {
    return parseInt(value);
});
import { readFileSync, existsSync } from 'fs'

function getSecret(name: string): string {
	const path = `/run/secrets/${name}`
	if (existsSync(path)) {
		return readFileSync(path, 'utf8').trim()
	}
}

export default () => new pg.Pool({
	database: getSecret('civslog_db_name') || 'timeline',
	host: process.env.PGHOST,
	password: getSecret('civslog_db_password') || 'postgis',
	user: getSecret('civslog_db_user') || 'postgres'
})
