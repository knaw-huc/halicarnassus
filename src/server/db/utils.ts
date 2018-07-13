import createPool from './pool'
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

	const pool = createPool()

	try {
		const result = await pool.query(sql, values)
		rows = result.rows
	} catch (err) {
		logError('execSql', ['SQL execution failed', sql, values.map((v, i) => `${i}: ${v}\n`).join(''), err])		
	}

	await pool.end()

	return rows
}