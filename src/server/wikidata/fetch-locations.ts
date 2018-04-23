import { WdLocation, WdEntity } from "../models"
import fetchClaimValue from "./fetch-claim-value"
import fetchEntities from "./fetch-entities"
import { logError } from "../utils"

export default async (wdEntityID: string, wdPropertyName: string): Promise<WdLocation[]> => {
	const locationIds = await fetchClaimValue(wdEntityID, wdPropertyName)
	const locations = await fetchEntities(locationIds)

	const createLocation = async (p: WdEntity): Promise<WdLocation> => {
		const label = p.label

		const rawCoordinates = await fetchClaimValue(p.id, 'coordinate location')
		let coordinates: string
		if (rawCoordinates.length) {
			if (rawCoordinates.length > 1) logError('fetchLocations', [`Multiple coordinates for location "${label}"`, `values: ${JSON.stringify(rawCoordinates)}`])
			coordinates = rawCoordinates[0]
		}

		const location: WdLocation = {
			coordinates, 
			description: p.description,
			label,
			wikidata_identifier: p.id,
		}

		return location
	}

	return await Promise.all(locations.map(createLocation))
}