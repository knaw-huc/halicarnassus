import * as path from 'path'
import * as express from 'express'
import template from './template'
import { orderEvents } from 'timeline'
import { selectEvents } from './sql';
import syncEvent from './sync-event'
import { execSql, selectOne } from './db/utils';

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

app.get('/api/events', async (req, res) => {
	const { viewportWidth, visibleRatio } = req.query
	const events = await execSql(selectEvents())
	res.send(JSON.stringify(orderEvents(events, viewportWidth, visibleRatio)))
})

const PORT = 3000
app.listen(PORT)
console.log(`Listening on port ${PORT}`)