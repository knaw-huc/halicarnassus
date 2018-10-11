import turfBezierSpline from '@turf/bezier-spline'
// import turfLength from '@turf/length'
import { lineString as turfLineString, Feature, LineString } from '@turf/helpers'
// // @ts-ignore
// import LineString from 'ol/geom/LineString'
// // @ts-ignore
// import { fromLonLat } from 'ol/proj'
// // @ts-ignore
// import Feature from 'ol/Feature'
// // @ts-ignore
// import Style from 'ol/style/Style'
// // @ts-ignore
// import Stroke from 'ol/style/Stroke'

const rammekens__the_cape =  [ 
  [ 3.653889, 51.4525 ],
  [ 3.6, 51.42 ],
  [ 3, 51.42 ],
  [ 1.5, 51 ],
  [ -1, 50 ],
  [ -6, 48.5],
  [ -18, 36 ],
  [ -28, 14 ],
  [ -32, -20 ],
  [ -30, -26 ],
  [ -18, -32 ],
  [ 18.44, -33.9 ] 
];

const the_cape__rammekens = [
  [19.335937500000007, -32.54681317351513],
  [-18.281250000000004, 5.965753671065542],
  [-24.960937500000004, 22.26876403907397],
  [-25.31250000000001, 38.548165423046584],
  [-21.796875000000004, 44.84029065139799],
  [-6.3281250000000115, 49.15296965617043],
  [2.8124999999999902, 50.958426723359935],
]

const the_cape__ceylon = [
  [18.413085937499993, -33.94335994657881],
  [17.929687499999996, -33.94335994657881],
  [18.391113281249993, -34.72355492704219],
  [19.885253906249993, -35.22767235493584],
  [25.971679687499993, -34.56085936708385],
  [30.717773437499993, -32.119801111793265],
  [38.49609375000001, -24.36711356265127],
  [44.12109375, -13.068776734357698],
  [47.28515625, -3.5134210456400297],
  [50.09765625, 0.7031073524364899],
  [55.54687500000001, 5.0909441750334],
  [63.28124999999999, 7.013667927566644],
  [79.453125, 7.188100871179017]
]

const ceylon__the_cape = [
  [79.62890625, 7.013667927566644],
  [71.015625, 2.1088986592431382],
  [63.6328125, -7.188100871179017],
  [58.18359375, -16.804541076383444],
  [56.6015625, -21.94304553343818],
  [46.40625, -29.84064389983442],
  [35.68359375, -34.45221847282653],
  [23.203125, -36.17335693522159],
  [18.28125, -35.31736632923786],
  [16.69921875, -32.546813173515154]
]

const the_cape__batavia = [
	[17, -33],
	[18, -35],
	[21, -36],
	[40, -35],
	[108, -33],
	[111, -28],
	[110, -23],
	[107, -14],
	[104, -8],
	[106, -5.8],
	[106.5, -6]
]

const batavia__the_cape = [
  [108.6328125, -5.615985819155327],
  [104.76562499999999, -6.315298538330012],
  [56.25, -20.961439614096847],
  [46.05468749999998, -29.84064389983442],
  [30.937499999999993, -35.17380831799957],
  [17.57812499999999, -36.87962060502676],
  [16.171874999999993, -33.431441335575286]
]

function toData(coordinates: number[][]) {
	const tls = turfLineString(coordinates)
	return turfBezierSpline(tls, { sharpness: .3 })

	// return ({
	// 	length: turfLength(bezier),
	// 	lineString: bezier,
	// })
}

export type Routes = {
  [key: string]: Feature<LineString>
}

const routes: Routes = {
  the_cape__ceylon: toData(the_cape__ceylon),
  ceylon__the_cape: toData(ceylon__the_cape),
  rammekens__the_cape: toData(rammekens__the_cape),
  the_cape__rammekens: toData(the_cape__rammekens),
  the_cape__batavia: toData(the_cape__batavia),
  batavia__the_cape: toData(batavia__the_cape),
}

export default routes