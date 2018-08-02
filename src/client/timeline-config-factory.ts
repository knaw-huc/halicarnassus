import { TimelineConfig } from "timeline";
import { VisibleComponents } from "./app";
import { OrderedEvents } from "timeline";
import { DEFAULT_ZOOM_LEVEL } from "../constants";

export default class TimelineConfigFactory {
	private readonly defaultConfig: TimelineConfig = ({
		events: {
			domains: [
				{
					heightRatio: .75,
					orderedEvents: this.orderedEvents,
				},
			],
			zoomLevel: DEFAULT_ZOOM_LEVEL,
		},
		minimaps: [
			{
				domains: [{
					targets: [0],
					heightRatio: .125,
					topOffsetRatio: .75,
				}],
				zoomLevel: 3
			},
			{	
				domains: [{
					targets: [0],
					heightRatio: .125,
					topOffsetRatio: .875,
				}]
			},
		],
		rootElement: this.rootElement,
	})

	private readonly mapOnlyConfig: TimelineConfig = {
		events: {
			domains: [
				{
					heightRatio: 0,
					orderedEvents: this.orderedEvents,
				},
			],
			zoomLevel: 10,
		},
		minimaps: [
			{
				domains: [{
					targets: [0],
					heightRatio: 0,
					topOffsetRatio: 0,
				}],
				zoomLevel: 2
			},
			{	
				domains: [{
					targets: [0],
					heightRatio: 1,
					topOffsetRatio: 0,
				}]
			},
		],
		rootElement: this.rootElement,
	}

	constructor(private rootElement, private orderedEvents: OrderedEvents) {}

	public getConfig(visibleComponents: VisibleComponents) {
		if (visibleComponents === VisibleComponents.Map) return this.mapOnlyConfig
		return this.defaultConfig
	}
}