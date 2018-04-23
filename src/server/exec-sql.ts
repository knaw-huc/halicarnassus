// import * as pg from "pg"
// pg.types.setTypeParser(20, function (value) {
//     return parseInt(value);
// });

// import chalk from 'chalk'

// export default async (sql: string, values: (string | number)[] = []): Promise<any[]> => {
// 	let rows = []
// 	const pool = new pg.Pool()
// 	try {
// 		const result = await pool.query(sql, values)
// 		rows = result.rows
// 	} catch (err) {
// 		console.error(chalk`{red [execSql] SQL execution failed}\n`, chalk`{gray [SQL]\n${sql}\n\n[VALUES]\n${values.map((v, i) => `${i}: ${v}\n`).join('')}}\n`, err)		
// 	}
// 	await pool.end()
// 	return rows
// }