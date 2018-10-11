// @ts-ignore
import * as format from 'ol/format'
// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
import View from 'ol/View'
// @ts-ignore
import * as style from 'ol/style'
import turfLength from '@turf/length'

import { Routes } from '../routes'

export default class RoutesManager {
	layer: layer.Vector
	lengths: {[key: string]: number } = {}
	routes: Routes
	private source: source.Vector

	constructor(public view: View, loadRoutes: () => Promise<Routes>) {
		this.source = new source.Vector()

		this.layer = new layer.Vector({
			source: this.source,
			style: new style.Style({
				stroke: new style.Stroke({ color: 'rgba(255, 255, 255, .3)', width: 4 })
			})
		})

		if (loadRoutes != null) loadRoutes().then(this.init)
	}

	init = (routes: Routes) => {
		if (routes == null) return
		this.routes = routes

		Object.keys(routes).forEach(key => {
			this.lengths[key] = turfLength(routes[key])
		})

		const bezierRoutes: any = Object.keys(routes).map(key => routes[key])
		const features = (new format.GeoJSON()).readFeatures({
			type: "FeatureCollection",
			features: bezierRoutes
		}, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		})

		this.source.addFeatures(features)

		if (features.length) this.view.fit(this.source.getExtent())
	}

}