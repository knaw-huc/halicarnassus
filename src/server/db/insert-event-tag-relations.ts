import chalk from 'chalk'
import { execSql } from './utils';

export default async (eventId, tagIds) => {
	if (eventId == null || !tagIds.length) return

	const rows = await execSql(`INSERT INTO event__tag
									(event_id, tag_id)
								VALUES
									${tagIds.map(id => `(${eventId}, ${id})`)}
								ON CONFLICT DO NOTHING`)

	if (rows.length) console.log(chalk`{green ${rows.length.toString()} tag(s) inserted/updated in db!}`)
}