import { WdLocation, Ev3nt } from '../models'
import { execSql } from './utils';

export default async (event: Ev3nt, startLocations: WdLocation[], endLocations: WdLocation[] = []) => {
	// console.log(event, startLocations, endLocations)
	startLocations = startLocations
		.filter(sl => sl != null)
		.map(bl => {
			bl.date = (event.date_min != null) ? event.date_min : event.date
			bl.end_date = (event.date_min != null) ? event.date : null
			return bl
		})

	if (!endLocations.length) {
		startLocations = startLocations.map(bl => {
			bl.date = (event.date_min != null) ? event.date_min : event.date
			bl.end_date = (event.end_date_max != null) ? event.end_date_max : event.end_date
			return bl
		})
	}

	endLocations = endLocations
		.filter(sl => sl != null)
		.map(dl => {
			dl.date = event.end_date
			dl.end_date = (event.end_date_max != null) ? event.end_date_max : null
			return dl
		})

	const locations = startLocations.concat(endLocations).filter(l => l.date != null)

	if (!locations.length) return

	const sql = `INSERT INTO event__location
					(event_id, location_id, date, end_date)
				VALUES
					${locations.map(location => `(${event.id}, ${location.id}, ${location.date}, ${location.end_date})`)}
				ON CONFLICT DO NOTHING`

	const rows = await execSql(sql)

	if (rows.length) console.log(`${rows.length} location(s) inserted/updated in db!`)
}