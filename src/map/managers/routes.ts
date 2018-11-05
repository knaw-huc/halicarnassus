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

import turfLength from '@turf/length'
import { Feature, LineString } from '@turf/helpers'
import { EventType } from '../constants';
import eventBus from '../event-bus';
import FeatureManager from './feature';

export type Routes = {
  [key: string]: Feature<LineString>
}

type Lengths = { [key: string]: number }

export default class RoutesManager extends FeatureManager {
	private readonly style = new style.Style({
		stroke: new style.Stroke({ color: 'rgba(255, 255, 255, .3)', width: 4 })
	})
	lengths: Lengths = {}
	routes: Routes

	constructor(loadRoutes: () => Promise<Routes>) {
		super() 

		this.source = new source.Vector()

		this.layer = new layer.Vector({
			source: this.source,
			style: this.style,
		})

		loadRoutes().then(routes => {
			if (routes == null) return
			this.routes = routes
			this.lengths = Object.keys(routes)
				.reduce((prev, curr) => {
					prev[curr] = turfLength(routes[curr])
					return prev	
				}, {} as Lengths)
			eventBus.dispatch(EventType.RoutesLoad)
		})
	}

	renderNextFrame(vectorContext: any) {
		const coordinates = this.features.map(feat => feat.getGeometry().getCoordinates())
		vectorContext.setStyle(this.style)
		vectorContext.drawGeometry(new geom.MultiLineString(coordinates))
	}

	setCoordinates() {
		const bezierRoutes: any = Object.keys(this.routes).map(key => this.routes[key])
		this.features = (new format.GeoJSON()).readFeatures({
			type: "FeatureCollection",
			features: bezierRoutes
		}, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		})
	}
}