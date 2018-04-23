import chalk from 'chalk'
import { WdDate, Ev3nt, WdEntity } from '../models'
import { execSql } from './utils';
import { logWarning } from '../utils';

export default async (entity: WdEntity, dates: WdDate[]): Promise<Ev3nt> => {
	let event: Ev3nt

	if (dates.every(d => d.timestamp == null)) {
		logWarning('insertEvent', [`Entity '${entity.label}' (${entity.id}) has no dates`])
	}
	const [dateMin, date, endDate, endDateMax] = dates

	const sql = `INSERT INTO event
					(label, description, date_min, date, end_date, end_date_max, date_min_granularity, date_granularity, end_date_granularity, end_date_max_granularity, wikidata_identifier)
				VALUES
					($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
				ON CONFLICT (wikidata_identifier)
				DO UPDATE SET
					label = $1,
					description = $2,
					date_min = $3,
					date = $4,
					end_date = $5,
					end_date_max = $6,
					date_min_granularity = $7,
					date_granularity = $8,
					end_date_granularity = $9,
					end_date_max_granularity = $10
				RETURNING *`

	const rows = await execSql(sql, [
		entity.label,
		entity.description,
		dateMin.timestamp,
		date.timestamp,
		endDate.timestamp,
		endDateMax.timestamp,
		dateMin.granularity,
		date.granularity,
		endDate.granularity,
		endDateMax.granularity,
		entity.id
	])

	if (rows.length) {
		console.log(chalk`\n{green [DB] Inserted event:}
{gray label}\t\t\t\t${entity.label}
{gray description}\t\t\t${entity.description}
{gray date min}\t\t\t${dateMin.dateString} (${dateMin.timestamp ? new Date(dateMin.timestamp).toISOString() : ''})
{gray date}\t\t\t\t${date.dateString} (${date.timestamp ? new Date(date.timestamp).toISOString() : ''})
{gray end date}\t\t\t${endDate.dateString} (${endDate.timestamp ? new Date(endDate.timestamp).toISOString() : ''})
{gray end date max}\t\t\t${endDateMax.dateString} (${endDateMax.timestamp ? new Date(endDateMax.timestamp).toISOString() : ''})
{gray date min granularity}\t\t${dateMin.granularity}
{gray date granularity}\t\t${date.granularity}
{gray end date granularity}\t\t${endDate.granularity}
{gray end date max granularity}\t${endDateMax.granularity}
{gray wikidata entity ID}\t\t${entity.id}\n\n`
		)

		event = rows[0]
	}

	return event
}