import fetchDates from "./fetch-dates"
import insertEvent from "../db/insert-event"
import handleLocations from './handle-locations'
import { Ev3nt, WdEntity } from "../models";

export default async (entity: WdEntity): Promise<Ev3nt> => {
	const dates = await fetchDates(entity.id)
	const event = await insertEvent(entity, dates)
	await handleLocations(event)
	return event
}