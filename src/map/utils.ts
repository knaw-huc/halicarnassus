// @ts-ignore
import { fromLonLat } from 'ol/proj'
// @ts-ignore
import Feature from 'ol/Feature'
// @ts-ignore
import * as geom from 'ol/geom'
// @ts-ignore
import * as style from 'ol/style'

import { Ev3ntLocation } from 'timeline'

export function getFeatureStyle(color: string = 'blue') {
	return new style.Style({
		image: new style.Circle({
			radius: 5,
			stroke: new style.Stroke({
				color: 'blue',
			}),
			fill: new style.Fill({ color })
		})
	})
}

export function createFeature(location: Ev3ntLocation, data?: any, styleFunc = getFeatureStyle) {
	let options = {
		geometry: new geom.Point(fromLonLat(location.coor4326.coordinates)),
	}

	if (data != null) {
		options = {
			...options,
			...data
		}
	}

	const marker = new Feature(options);
	marker.setStyle(styleFunc())

	return marker
}

// export function createFeatureFromPoint(point: [number, number], data?: any, styleFunc?: any) {
// 	return createFeature(
// 		{
// 			coor: {
// 				type: "Point",
// 				coordinates: point
// 			},
// 		},
// 		data,
// 		styleFunc
// 	)
// }