// @ts-ignore
import WebGLMap from 'ol/WebGLMap'
// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
import * as style from 'ol/style'
// @ts-ignore
import View from 'ol/View'
// @ts-ignore
import { fromLonLat } from 'ol/proj'
// @ts-ignore
import Select from 'ol/interaction/Select'
// @ts-ignore
import { click } from 'ol/events/condition'

import { TimelineProps, Ev3nt } from 'timeline'

import EventsManager from './managers/events'
import RoutesManager from './managers/routes'
import VoyagesManager from './managers/voyages'
import PopupManager from './managers/popup'
import { Routes } from './routes';

export interface MapProps {
	handleEvent: (features: any[]) => void
	popupElement: HTMLDivElement
	loadRoutes: () => Promise<Routes>,
	target: string,
}
export default class Map {
	private map: ol.Map
	private eventsManager = new EventsManager()
	// private routesManager: RoutesManager
	private voyagesManager: VoyagesManager
	private popupManager: PopupManager
	handleEvent: any
	private select: ol.interaction.Select

	constructor(props: MapProps) {
		this.handleEvent = props.handleEvent

		const tileLayer = new layer.Tile({
			source: new source.XYZ({
				attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
				crossOrigin: 'anonymous',
				url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
			})
		});

		const view = new View({
			center: fromLonLat([0, 30]),
			zoom: 4
		})

 		const routesManager = new RoutesManager(view, props.loadRoutes)
		this.voyagesManager = new VoyagesManager(routesManager)
		this.popupManager = new PopupManager(view, props.popupElement)

		this.map = new WebGLMap({
			target: props.target,
			layers: [
				tileLayer,
				routesManager.layer,
				this.voyagesManager.layer,
				this.eventsManager.layer
			],
			overlays: [
				this.popupManager.overlay
			],
			view,
		})
		
		this.select = new Select({
			condition: click, 
			layers: [
				this.voyagesManager.layer,
				// this.routesManager.layer,
				this.eventsManager.layer
			], 
			multi: true
		})
		this.select.on('select', this.handleClick)
		this.map.addInteraction(this.select)
		this.map.on('postcompose', this.animate)
	}

	private animate = (event: any) => {
		this.eventsManager.renderNextFrame(event.vectorContext)
		this.voyagesManager.renderNextFrame(event.vectorContext)
	}

	private handleClick = (_ev: any) => {
		// console.log(ev.target)
		console.log(this.select.getFeatures())
	// 	var features = this.map.getFeaturesAtPixel(ev.pixel);
	// 	console.log(features)
	// 	return
	// 	if (features != null) {
	// 		this.handleEvent(features)
	// 		this.popupManager.show(features[0].getGeometry().getCoordinates())
	// 	}
	}

	hidePopup() {
		this.popupManager.hide()
	}

	onSelect(event: Ev3nt) {
		let feature = this.eventsManager.features.find((f: any) => f.getProperties().event.id === event.id)
		if (feature == null) {
			feature = this.voyagesManager.features.find((f: any) => f.getProperties().event.id === event.id)
		}
		if (feature) {
			this.handleEvent([feature])
			this.popupManager.show(feature.getGeometry().getCoordinates())
		}
	}

	play() {
		this.eventsManager.play()
		this.voyagesManager.play()
	}

	pause() {
		setTimeout(() => {
			this.eventsManager.pause()
			this.voyagesManager.pause()
			this.map.render()
		}, 100)
	}

	setVisibleEvents(visibleEvents: Ev3nt[], props: TimelineProps) {
		this.eventsManager.setCoordinates(visibleEvents)
		this.voyagesManager.setCoordinates(visibleEvents, props.center)
		this.map.render()
	}

	updateSize() {
		this.map.updateSize()
	}
}