// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
import * as geom from 'ol/geom'
// @ts-ignore
import { fromLonLat } from 'ol/proj'

import { Ev3nt, Ev3ntLocation } from 'timeline'
import { getFeatureStyle, createFeature } from '../utils'

export default class EventsManager {
	// private readonly style: Style = new Style({ image: getMarkerStyle('rgb(49, 220, 215)') })
	private readonly style = getFeatureStyle('rgb(49, 220, 215)')
	source: ol.source.Vector
	private featuresCache: { [ eventID: string ]: ol.Feature } = {}
	features: any[] = []
	layer: ol.layer.Vector
	// select: ol.interaction.Select

	constructor() {
		this.source = new source.Vector({
			wrapX: false
		});
		this.layer = new layer.Vector({
			source: this.source,
			style: this.style,
		})
	}

	// private handleClick = (ev: any) => {
	// 	console.log(ev.target)
	// 	if (ev.target.getFeatures().getLength() === 1) {
	// 		const feature = ev.target.getFeatures().item(0)
	// 		console.log(feature)
	// 		// const currentPlaces = feature.getProperties().route.split('__')
	// 		// const placeFeatures = Object.keys(places)
	// 		// 	.filter(slug => currentPlaces.indexOf(slug) > -1)
	// 		// 	.map(slug => createPlaceMarker((places as any)[slug].name, (places as any)[slug].coors))

	// 		// this.source.clear()
	// 		// this.source.addFeatures(this.features.concat(placeFeatures))
	// 	}
	// }

	play() {
		// this.select.getFeatures().clear()
		this.source.clear()
	}

	pause() {
		this.source.addFeatures(this.features)
	}

	renderNextFrame(vectorContext: any) {
		for (const feature of this.features) {
			vectorContext.drawFeature(feature, feature.getStyle());
		}
	}

	private featureFromCache = (event: Ev3nt) => {
		return (location: Ev3ntLocation, index: number) => {
			const key = `${event.id}-${index}`
			if (!this.featuresCache.hasOwnProperty(key)) {
				this.featuresCache[key] = createFeature(location, {
					event,
					id: key
				})
			} else {
				// Update the color (fill) of the feature
				this.featuresCache[key].setStyle(getFeatureStyle(event.color))
			}
			return this.featuresCache[key]
		}
	}

	setCoordinates(events: Ev3nt[]): void {
		this.features = events
			.reduce((prev, event) => {
				if (event.locs == null) return prev
				const cachedFeatures = event.locs.map(this.featureFromCache(event))
				return prev.concat(...cachedFeatures)
			}, [])
	}
}