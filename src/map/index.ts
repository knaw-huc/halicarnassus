// @ts-ignore
import Feature from 'ol/Feature'
// @ts-ignore
import OlMap from 'ol/WebGLMap'
// @ts-ignore
import Point from 'ol/geom/Point'
// @ts-ignore
import { fromLonLat, transform } from 'ol/proj'
// @ts-ignore
import Stamen from 'ol/source/Stamen'
// @ts-ignore
import TileLayer from 'ol/layer/Tile'
// @ts-ignore
import VectorLayer from 'ol/layer/Vector'
// @ts-ignore
import Overlay from 'ol/Overlay'
// @ts-ignore
import VectorSource from 'ol/source/Vector'
// @ts-ignore
import View from 'ol/View'
import Popup from './popup'
// import { battleIconStyle } from './icons'
import { RawEv3nt, TimelineProps } from 'timeline'

// @ts-ignore
import Style from 'ol/style/Style'
// @ts-ignore
import CircleStyle from 'ol/style/Circle'
// @ts-ignore
import Fill from 'ol/style/Fill'
// @ts-ignore
import Stroke from 'ol/style/Stroke'

const vectorSource = new VectorSource({});

const markers = new VectorLayer({
	source: vectorSource
});

const layers = [
	new TileLayer({
		source: new Stamen({
			layer: 'toner-background'
		})
	}),
	markers
]

const view = new View({
	center: fromLonLat([0, 50]),
	zoom: 4
})

export interface MapProps {
	handleEvent: (name: string, data: any) => void
	target: string,
}
export default class Map {
	private map: OlMap
	private popup: Popup
	private features: { [ eventID: string ]: Feature } = {}

	constructor(props: MapProps) {
		const popupOverlay = new Overlay({
			autoPan: true,
			autoPanAnimation: { duration: 250, source: null }
		})

		this.popup = new Popup(popupOverlay)
		
		popupOverlay.setElement(this.popup.el)

		const overlays = [popupOverlay]

		this.map = new OlMap({
			target: props.target,
			layers,
			overlays,
			view,
		})

		this.map.on('click', this.handleClick)
	}

	private handleClick = (e: any) => {
		var features = this.map.getFeaturesAtPixel(e.pixel);
		if (features != null) this.popup.show(features)
	}

	private createImageStyle(color: string) {
		return new CircleStyle({
			radius: 6,
			stroke: new Stroke({
				color: 'black',
			}),
			fill: new Fill({ color })
		})
	}

	private createFeature(event: RawEv3nt, location: any, id: string): any {
		const coor = JSON.parse(location.f1)
		const marker = new Feature({
			geometry: new Point(transform(coor.coordinates, 'EPSG:4326', 'EPSG:3857')),
			coordinates: coor,
			date: location.f2,
			end_date: location.f3,
			event,
		});
		marker.setId(id)

		marker.setStyle(new Style({
			image: this.createImageStyle(event.color)
		}))

		return marker
	}

	private updateFeatures(visibleEvents: RawEv3nt[]): void {
		this.popup.hide()

		const features = visibleEvents
			.reduce((prev, event) => {
				if (event.locations == null) return prev
				const ftrs = event.locations
					.map((location, index) => {
						const key = `${event.id}-${index}`
						if (!this.features.hasOwnProperty(key)) {
							this.features[key] = this.createFeature(event, location, key)
						} else {
							// Update the color (fill) of the feature
							this.features[key].getStyle().setImage(this.createImageStyle(event.color))
						}
						return this.features[key]
					})
				return prev.concat(...ftrs)
			}, [])

		vectorSource.clear()
		vectorSource.addFeatures(features);
	}

	onSelect(event: RawEv3nt) {
		const feature = vectorSource.getFeatures().find((f: any) => f.getProperties().event.id === event.id)
		if (feature) this.popup.show([feature])
	}

	setVisibleEvents(visibleEvents: RawEv3nt[], _props: TimelineProps) {
		this.updateFeatures(visibleEvents)
	}

	updateSize() {
		this.map.updateSize()
	}
}