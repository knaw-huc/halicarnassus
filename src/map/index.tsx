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

// @ts-ignore
import Style from 'ol/style/Style'
// @ts-ignore
import CircleStyle from 'ol/style/Circle'
// @ts-ignore
import Fill from 'ol/style/Fill'
// @ts-ignore
import Stroke from 'ol/style/Stroke'

import { RawEv3nt, TimelineProps, Ev3ntLocation } from 'timeline'

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
	handleEvent: (features: any[]) => void
	popupElement: HTMLDivElement
	target: string,
}
export default class Map {
	private map: OlMap
	private features: { [ eventID: string ]: Feature } = {}
	handleEvent: any

	constructor(props: MapProps) {
		this.handleEvent = props.handleEvent

		const popupOverlay = new Overlay({
			id: 'popup',
		})
		
		popupOverlay.setElement(props.popupElement)

		this.map = new OlMap({
			target: props.target,
			layers,
			overlays: [popupOverlay],
			view,
		})

		this.map.on('click', this.handleClick)
	}

	private handleClick = (ev: any) => {
		console.log(ev.target)
		var features = this.map.getFeaturesAtPixel(ev.pixel);
		if (features != null) {
			this.handleEvent(features)
			this.showPopup(features[0].getGeometry().getCoordinates())
		}
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

	private showPopup(coordinates: any) {
		this.map.getView().animate({
			center: coordinates,
			duration: 250
		})
		this.map.getOverlayById('popup').setPosition(coordinates)
	}

	hidePopup() {
		this.map.getOverlayById('popup').setPosition(null)
	}

	private createFeature(event: RawEv3nt, location: Ev3ntLocation, id: string): any {
		const marker = new Feature({
			geometry: new Point(location.coor.coordinates),
			coordinates: new Point(location.coor.coordinates),
			date: location.d,
			end_date: location.ed,
			event,
		});
		marker.setId(id)

		marker.setStyle(new Style({
			image: this.createImageStyle(event.color)
		}))

		return marker
	}

	private updateFeatures(visibleEvents: RawEv3nt[]): void {
		this.hidePopup()

		const features = visibleEvents
			.reduce((prev, event) => {
				if (event.locs == null) return prev
				const ftrs = event.locs
					.map((location, index: number) => {
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
		if (feature) {
			this.handleEvent([feature])
			this.showPopup(feature.getGeometry().getCoordinates())
		}
	}

	setVisibleEvents(visibleEvents: RawEv3nt[], _props: TimelineProps) {
		this.updateFeatures(visibleEvents)
	}

	updateSize() {
		this.map.updateSize()
	}
}