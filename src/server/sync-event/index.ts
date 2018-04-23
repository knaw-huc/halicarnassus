import fetchEntities from "../wikidata/fetch-entities"
import handleEvent from '../handle-event'

export default async (wikidataID: string) => {
	const entities = await fetchEntities([wikidataID])
	const entity = entities[0]
	const event = await handleEvent(entity)
	return event
}