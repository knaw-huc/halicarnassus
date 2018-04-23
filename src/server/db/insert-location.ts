import chalk from 'chalk'
import { execSql } from './utils'
import { Ev3nt, WdLocation } from '../models'

export default async (event: Ev3nt, location: WdLocation): Promise<WdLocation> => {
	if (location.coordinates == null) return 

	const sql = `INSERT INTO location
					(label, description, coordinates, wikidata_identifier)
				VALUES
					($1, $2, ST_GeogFromText('SRID=4326;POINT(${location.coordinates.split(' ').reverse().join(' ')})'), $3)
				ON CONFLICT (coordinates)
				DO UPDATE SET
					label = $1,
					description = $2,
					wikidata_identifier = $3
				RETURNING *`

	const rows = await execSql(sql, [location.label, location.description, location.wikidata_identifier])

	if (rows.length) {
		console.log(chalk`\n{green [DB] Inserted location:}
{gray label}\t\t\t${location.label}
{gray description}\t\t${location.description}
{gray coordinates}\t\t${location.coordinates}
{gray wikidata entity ID}\t${location.wikidata_identifier}\n\n`
		)
		location = rows[0]
	}

	return location
}