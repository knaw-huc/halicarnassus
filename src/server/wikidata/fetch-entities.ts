import { execFetch } from "../utils"
import { WdEntity } from "../models"
import { WIKIDATA_URL } from '../../constants'

export default async (wdEntityIDs: string[]): Promise<WdEntity[]> => {
	if (!wdEntityIDs.length) return []
	const json = await execFetch(`${WIKIDATA_URL}?action=wbgetentities&ids=${wdEntityIDs.join('|')}&props=labels|descriptions&languages=en&format=json`)
	return Object.keys(json.entities).map(k => json.entities[k]).map(e => new WdEntity(e))
}
