// @ts-ignore
import * as geom from 'ol/geom'
// @ts-ignore
import * as format from 'ol/format'
// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
// import View from 'ol/View'
// @ts-ignore
import * as style from 'ol/style'
// @ts-ignore
import OLPolygon from 'ol/geom/Polygon'
// @ts-ignore
import OLFeature from 'ol/Feature'

import { Ev3nt } from 'timeline'
import { Feature, Polygon } from '@turf/helpers'
import eventBus from '../event-bus'
import { EventType } from '../constants'
import FeatureManager from './feature'

export type Areas = {
  [key: string]: Feature<Polygon>
}

export default class AreaManager extends FeatureManager {
	private readonly style = new style.Style({
		stroke: new style.Stroke({
			color: 'rgba(255, 0, 0, .6)',
			width: 2,
		}),
		fill: new style.Fill({
			color: `rgba(255, 0, 0, .3)`
		})
	})

	private areas: Areas

	constructor(public view: any/*View*/, loadRoutes: () => Promise<Areas>) {
		super()

		this.source = new source.Vector()

		this.layer = new layer.Vector({
			source: this.source,
			style: this.style
		})

		loadRoutes().then((areas: Areas) => {
			if (areas == null) return
			this.areas = areas
			eventBus.dispatch(EventType.AreasLoad)
		})
	}

	/**
	 * Render the content of this layer on the current frame
	 * 
	 * Using the vector context is more performant than clearing
	 * and adding features to the source. So for animation we use
	 * this method, when the animation stops, the 'real' features
	 * are added to the source
	 */
	renderNextFrame(vectorContext: any) {
		const coordinates = this.features.reduce((prev, curr) => {
			const geom = curr.getGeometry()

			if (geom.getType() === 'Polygon') prev.push(geom.getCoordinates())
			else if (geom.getType() === 'MultiPolygon') prev.push(...geom.getCoordinates())

			return prev
		}, [])
		vectorContext.setStyle(this.style)
		vectorContext.drawGeometry(new geom.MultiPolygon(coordinates))
	}

	setCoordinates(events: Ev3nt[], center: number): void {
		const jsonFeatures: any[] = events 
			.filter(e => e.areas != null && e.areas.length)
			.reduce((prev, curr) => prev.concat(curr.areas), [])
			.filter(area => center >= area.d && center <= area.ed)
			.map(event => {
				const jsonFeature = this.areas[event.area]
				jsonFeature.properties = { event }
				return jsonFeature
			})

		const polygons = {
			type: 'FeatureCollection',
			features: jsonFeatures
		}

		const geoJSON = new format.GeoJSON()
		this.features = geoJSON.readFeatures(polygons, {
			dataProjection: 'EPSG:4326',
			featureProjection: 'EPSG:3857'
		})//.map((f: any) => {
		// 	console.log('f', f)
		// 	const s = this.style.clone()
		// 	s.setText(new style.Text({
		// 		fill: new style.Fill({ color: 'red' }),
		// 		font: '30px sans-serif',
		// 		stroke: new style.Stroke({ color: 'white', width: 4 }),
		// 		text: "testing \n let's \n do \n it"
		// 	}))
		// 	f.setStyle(s)

		// 	return f
		// })


		// this.areaCoordinates = this.features.map((f: any) => f.getGeometry().getCoordinates())
	}
}