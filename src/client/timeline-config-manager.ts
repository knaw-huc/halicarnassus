import { TimelineConfig, EventsBand, MinimapBand } from "timeline"
import { VisibleComponents } from "./app"
import { OrderedEvents } from "timeline"
import { BATTLES_ZOOM_LEVEL, WARS_ZOOM_LEVEL } from "../constants"

export default class TimelineConfigManager {
	battlesBand: EventsBand
	warsBand: EventsBand
	// minimapBand1: MinimapBand
	minimapBand2: MinimapBand

	getDefaultConfig(): TimelineConfig {
		return {
			center: Date.UTC(1471, 0),
			bands: [
				this.warsBand,
				this.battlesBand,
				// this.minimapBand1,
				this.minimapBand2
			],
			rootElement: this.rootElement,
		}
	}

	constructor(private rootElement, orderedBattles: OrderedEvents, orderedWars: OrderedEvents) {
		this.warsBand = new EventsBand({
			heightRatio: .25,
			label: 'wars',
			orderedEvents: orderedWars,
			zoomLevel: WARS_ZOOM_LEVEL,
		})

		this.battlesBand = new EventsBand({
			heightRatio: .65,
			label: 'battles',
			orderedEvents: orderedBattles,
			topOffsetRatio: .25,
			zoomLevel: BATTLES_ZOOM_LEVEL,
		})

		// this.minimapBand1 = new MinimapBand({
		// 	targets: [0],
		// 	heightRatio: .125,
		// 	topOffsetRatio: .75,
		// 	zoomLevel: 3
		// })

		this.minimapBand2 = new MinimapBand({	
			targets: [0],
			heightRatio: .1,
			topOffsetRatio: .9,
		})
	}

	public updateConfig(visibleComponents: VisibleComponents) {
		if (visibleComponents === VisibleComponents.Map) {
			this.warsBand.updateConfig({
				heightRatio: 0
			})

			this.battlesBand.updateConfig({
				heightRatio: 0
			})

			// this.minimapBand1.updateConfig({
			// 	heightRatio: 0,
			// })

			this.minimapBand2.updateConfig({
				topOffsetRatio: 0,
				heightRatio: 1,
			})
		} else {
			this.warsBand.updateConfig({
				heightRatio: .25,
			})

			this.battlesBand.updateConfig({
				heightRatio: .65,
			})

			// this.minimapBand1.updateConfig({
			// 	heightRatio: .125,
			// })

			this.minimapBand2.updateConfig({
				topOffsetRatio: .9,
				heightRatio: .1,
			})
		}
	}
}