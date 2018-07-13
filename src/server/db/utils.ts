import { readFileSync } from 'fs'
import * as pg from "pg"
pg.types.setTypeParser(20, function (value) {
    return parseInt(value);
});
import { logError } from '../utils'

export const selectOne = async (table, field, value): Promise<any> => {
	const sql = `SELECT *
				FROM ${table}
				WHERE ${field}=$1`
	const rows = await execSql(sql, [value])
	return rows[0]
}

export const execSql = async (sql: string, values: (string | number)[] = []) : Promise<any[]> => {
	let rows = []

	const pool = new pg.Pool({
		database: readFileSync('/run/secrets/civslog_db_name', 'utf8').trim(),
		host: process.env.PGHOST,
		password: readFileSync('/run/secrets/civslog_db_password', 'utf8').trim(),
		user: readFileSync('/run/secrets/civslog_db_user', 'utf8').trim(),
	})

	try {
		const result = await pool.query(sql, values)
		rows = result.rows
	} catch (err) {
		logError('execSql', ['SQL execution failed', sql, values.map((v, i) => `${i}: ${v}\n`).join(''), err])		
	}

	await pool.end()

	return rows
}