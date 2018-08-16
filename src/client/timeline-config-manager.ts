import { TimelineConfig, EventsBand, MinimapBand } from "timeline"
import { VisibleComponents } from "./app"
import { OrderedEvents } from "timeline"
import { DEFAULT_ZOOM_LEVEL } from "../constants"

export default class TimelineConfigManager {
	eventsBand: EventsBand
	minimapBand1: MinimapBand
	minimapBand2: MinimapBand

	getDefaultConfig(): TimelineConfig {
		return {
			center: Date.UTC(1810, 0),
			bands: [
				this.eventsBand,
				this.minimapBand1,
				this.minimapBand2
			],
			rootElement: this.rootElement,
		}
	}

	constructor(private rootElement, orderedEvents: OrderedEvents) {
		this.eventsBand = new EventsBand({
			heightRatio: .75,
			orderedEvents: orderedEvents,
			zoomLevel: DEFAULT_ZOOM_LEVEL,
		})

		this.minimapBand1 = new MinimapBand({
			targets: [0],
			heightRatio: .125,
			topOffsetRatio: .75,
			zoomLevel: 3
		})

		this.minimapBand2 = new MinimapBand({	
			targets: [0],
			heightRatio: .125,
			topOffsetRatio: .875,
		})
	}

	public updateConfig(visibleComponents: VisibleComponents) {
		if (visibleComponents === VisibleComponents.Map) {
			this.eventsBand.updateConfig({
				heightRatio: 0
			})

			this.minimapBand1.updateConfig({
				topOffsetRatio: 0,
				heightRatio: 0,
			})

			this.minimapBand2.updateConfig({
				topOffsetRatio: 0,
				heightRatio: 1,
			})
		} else {
			this.eventsBand.updateConfig({
				heightRatio: .75,
			})

			this.minimapBand1.updateConfig({
				topOffsetRatio: .75,
				heightRatio: .125,
			})

			this.minimapBand2.updateConfig({
				topOffsetRatio: .875,
				heightRatio: .125,
			})
		}
	}
}