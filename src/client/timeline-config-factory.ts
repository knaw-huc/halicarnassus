import { TimelineConfig } from "timeline";
import { VisibleComponents } from "./app";
import { OrderedEvents } from "timeline";

export default class TimelineConfigFactory {
	private _config: TimelineConfig
	private set config(config: TimelineConfig) {
		if (this._config == null) this._config = config
		else {
			if (config.hasOwnProperty('domains') && config.domains.length === this._config.domains.length) {
				this._config.domains = this._config.domains.map((d, i) => {
					return { ...d, ...config.domains[i] }
				})
				delete config.domains
			}
			this._config = { ...this._config, ...config }
		}
	}

	constructor(private rootElement, private orderedEvents: OrderedEvents) {}

	public getConfig(visibleComponents: VisibleComponents) {
		this.config = {
			domains: [
				{
					heightRatio: .75,
					orderedEvents: this.orderedEvents,
					type: 'events',
					visibleRatio: .01,
				},
				{
					targets: [0],
					heightRatio: .125,
					topOffsetRatio: .75,
					type: 'minimap',
					visibleRatio: .05
				},
				{	
					targets: [0],
					heightRatio: .125,
					topOffsetRatio: .875,
					type: 'minimap',
				},
			],
			rootElement: this.rootElement,
		}

		if (visibleComponents === VisibleComponents.Map) {
			this.config = {
				domains: [
					{
						heightRatio: 0,
						topOffsetRatio: 0,
					},
					{
						heightRatio: 0,
						topOffsetRatio: 0,
					},
					{
						heightRatio: 1,
						topOffsetRatio: 0,
					},
				]
			}
		}

		return this._config
	}
}