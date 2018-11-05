import turfAlong from '@turf/along'
import turfLength from '@turf/length'

// @ts-ignore
import { fromLonLat } from 'ol/proj'
// @ts-ignore
import Feature from 'ol/Feature'
// @ts-ignore
import * as geom from 'ol/geom'
// @ts-ignore
import * as format from 'ol/format'
// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
import * as style from 'ol/style'

import { Ev3nt, Voyage } from 'timeline';
import { Milliseconds } from 'timeline/build/constants';
import { getFeatureStyle } from '../utils';
import RoutesManager from './routes';
import FeatureManager from './feature';

const places = {
	the_cape: {
		name: "The Cape",
		coors: [2051989.25, -4015382.36],
	},
	ceylon: {
		name: "Ceylon",
		coors: [8888273.80, 775886.28],
	},
	rammekens: {
		name: "The Netherlands",
		coors: [406749.06, 6701729.45],
	},
	batavia: {
		name: "Batavia",
		coors: fromLonLat([106.813222, -6.134836]),
	}
}

const triangle = new style.RegularShape({
	fill: new style.Fill({ color: 'black' }),
	stroke: new style.Stroke({ color: 'black' }),
	points: 3,
	radius: 6,
	rotation: Math.PI / 3,
	angle: 0
})
function createPlaceMarker(name: string, coors: [number, number]) {
	const marker = new Feature({
		geometry: new geom.Point(coors),
	})

	marker.setStyle(new style.Style({
		image: triangle,
		text: new style.Text({
			text: name,
			offsetY: -10
		})
	})
)
	return marker
}

export default class VoyagesManager extends FeatureManager {
	private readonly style = getFeatureStyle('rgb(49, 220, 215)')
	// private coordinates: [number, number][] = []
	source: ol.source.Vector
	features: any[] = []
	layer: ol.layer.Vector
	routesManager: RoutesManager

	constructor() {
		super()

		this.source = new source.Vector({});
		this.layer = new layer.Vector({
			source: this.source,
			style: this.style
		})
	}

	// FIXME call from index
	onSelect(ev: any) {
		if (ev.target.getFeatures().getLength() === 1) {
			const feature = ev.target.getFeatures().item(0)
			const currentPlaces = feature.getProperties().route.split('__')
			const placeFeatures = Object.keys(places)
				.filter(slug => currentPlaces.indexOf(slug) > -1)
				.map(slug => createPlaceMarker((places as any)[slug].name, (places as any)[slug].coors))

			this.source.clear()
			this.source.addFeatures(this.features.concat(placeFeatures))
		}
	}

	// play() {
	// 	// this.select.getFeatures().clear()
	// 	this.source.clear()
	// }

	// pause() {
	// 	this.drawFeatures()
	// 	this.features = []
	// }

	// drawFeatures() {
	// 	this.source.clear()
	// 	this.source.addFeatures(this.features)
	// }

	renderNextFrame(vectorContext: any) {
		const coordinates = this.features.map((f: any) => f.getGeometry().getCoordinates())
		vectorContext.setStyle(this.style);
		vectorContext.drawGeometry(new geom.MultiPoint(coordinates));
	}

	setCoordinates(events: Ev3nt[], center: Milliseconds): void {
		const voyages: Voyage[] = events 
			.filter(e => e.voyages != null && e.voyages.length)
			.reduce((prev, curr) => prev.concat(curr.voyages), [])
			.filter(voy => center > voy.d && center < voy.ed)

		const positions = {
			type: 'FeatureCollection',
			features: voyages.map(voyage => {
				let ratio = (center - voyage.d) / (voyage.ed - voyage.d)

				let route: Feature
				let routeLength: number

				// There is no given route, so we construct a line string between
				// the start point and the end point
				if (voyage.route == null && voyage.sp != null && voyage.ep != null) {
					route = {
						type: "Feature",
						properties: {},
						geometry: {
							type: "LineString",
							coordinates: [voyage.sp.coordinates, voyage.ep.coordinates]
						}
					}
					routeLength = turfLength(route)
				}
				// Use the given route
				else if (
					voyage.route != null &&
					this.routesManager != null &&
					this.routesManager.routes.hasOwnProperty(voyage.route)
				) {
					route = this.routesManager.routes[voyage.route]
					routeLength = this.routesManager.lengths[voyage.route]
				}
				// No route found, we're lost :)
				else {
					console.error('Unknown route!')
					return
				}

				const geoJSONFeature = turfAlong(route, ratio * routeLength)
				geoJSONFeature.properties.route = voyage.route

				return geoJSONFeature
			})
		}

		this.features = (new format.GeoJSON()).readFeatures(positions, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		})
		
	}
}