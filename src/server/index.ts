import * as reload from 'reload'
import * as path from 'path'
import * as express from 'express'
import template from './template'
import { calcPixelsPerMillisecond, orderEvents } from 'timeline'
import { selectEvents } from './sql';
import syncEvent from './sync-event'
import { execSql, selectOne } from './db/utils';

// TODO remove code used for civslog-cli

const app = express()
app.disable('x-powered-by')

app.use(express.static(path.resolve(process.cwd(), './node_modules')))
app.use(express.static(process.cwd()))

app.get('/', (req, res) =>  {
	res.send(template(''))
})

app.get('/api/sync-event/:wikidataID', async (req, res) => {
	const event = await syncEvent(req.params.wikidataID)
	const events = await execSql(selectEvents(`WHERE id = $1`), [event.id])
	res.send(JSON.stringify(events[0]))
})

// TODO use transactions
app.delete('/api/events/:wikidataID', async (req, res) => {
	const event = await selectOne('event', 'wikidata_identifier', req.params.wikidataID)
	await execSql(`DELETE FROM event__location WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__tag WHERE event_id = $1`, [event.id])
	await execSql(`DELETE FROM event__event WHERE parent_event_id = $1 OR child_event_id = $1`, [event.id])
	res.send()
})

app.get('/api/events/:tagid', async (req, res) => {
	const { viewportWidth, zoomLevel } = req.query
	let events = await execSql(selectEvents('WHERE event__tag.tag_id = $1 AND event__tag.event_id = event.id'), [req.params.tagid])
	events = events.filter(e => !(e.date_min == null && e.date == null && e.end_date == null && e.end_date_max == null))

	const from = events[0].date_min || events[0].date
	const to = events.reduce((prev, curr) => {
		return Math.max(prev, curr.end_date || -Infinity, curr.end_date_max || -Infinity)
	}, -Infinity)

	const pixelsPerMilliseconds = calcPixelsPerMillisecond(viewportWidth, zoomLevel, to - from)
	res.send(JSON.stringify(orderEvents(events, pixelsPerMilliseconds)))
})

if (process.env.NODE_ENV === 'development') reload(app)

const PORT = 3000
app.listen(PORT)
console.log(`Listening on port ${PORT}`)