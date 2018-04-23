export const selectEvents = (where?: string) => {
	const part1 =
		`SELECT
			event.*,
			(
				SELECT json_agg(tag.label)
				FROM tag, event__tag
				WHERE tag.id = event__tag.tag_id
					AND event__tag.event_id = event.id
			) AS tags,
			(
				SELECT json_agg((ST_AsGeoJson(location.coordinates), event__location.date, event__location.end_date))
				FROM location, event__location
				WHERE event__location.event_id = event.id
					AND event__location.location_id = location.id
			) AS locations
		FROM event`

	where = where == null ? ' ' : ` ${where} `

	const part2 =
		`GROUP BY event.id
		ORDER BY
			CASE
				WHEN event.date_min IS NOT NULL THEN event.date_min
				WHEN event.date IS NOT NULL THEN event.date
			END,
			CASE
				WHEN event.end_date IS NOT NULL THEN event.end_date
				WHEN event.end_date_max IS NOT NULL THEN event.end_date_max
			END`

	return part1 + where + part2
}