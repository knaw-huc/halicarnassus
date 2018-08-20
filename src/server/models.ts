export type EventType = 'human' | 'battle'

export class WdDate {
	dateString: string = null
	granularity: string = null
	timestamp: number = null
}

export class WdEntity {
	label: string
	description: string
	id: string

	constructor(entity) {
		this.id = entity.id	
		if (entity.hasOwnProperty('labels') && entity.labels.hasOwnProperty('en') && entity.labels.en.hasOwnProperty('value')) this.label = entity.labels.en.value
		if (entity.hasOwnProperty('descriptions') && entity.descriptions.hasOwnProperty('en') && entity.descriptions.en.hasOwnProperty('value'))	this.description = entity.descriptions.en.value
	}
}

export class WdLocation {
	coordinates: string
	date?: number
	description: string = null
	end_date?: number
	id?: string
	label: string = null
	wikidata_identifier: string = null
}

export class Ev3nt {
	date: number
	date_min: number
	date_granulirity: string
	date_min_granularity: string
	description: string
	end_date: number
	end_date_max: number
	end_date_granularity: string
	end_date_max_granularity: string
	id: string
	label: string
	tags?: string[]
	wikidata_identifier: string
}