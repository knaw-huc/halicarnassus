// @ts-ignore
import WebGLMap from 'ol/WebGLMap'
// @ts-ignore
import * as source from 'ol/source'
// @ts-ignore
import * as layer from 'ol/layer'
// @ts-ignore
import * as extent from 'ol/extent'
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

import { Ev3nt } from 'timeline'

import EventsManager from './managers/events'
import RoutesManager, { Routes } from './managers/routes'
import VoyagesManager from './managers/voyages'
import AreasManager, { Areas } from './managers/areas'
import PopupManager from './managers/popup'
import { EventType } from './constants'
import eventBus from './event-bus';
import { Extent } from 'openlayers';
import FeatureManager from './managers/feature';

export interface MapProps {
	handleEvent: (features: any[]) => void
	popupElement: HTMLDivElement
	loadRoutes: () => Promise<Routes>,
	loadAreas: () => Promise<Areas>,
	target: string,
}
export default class Map {
	handleEvent: any


	private featureManagers: FeatureManager[] = []
	// private areasManager: AreasManager
	// private eventsManager: EventsManager
	// private featureLayersGroup: layer.Group
	private map: ol.Map
	private popupManager: PopupManager
	private select: ol.interaction.Select
	// private voyagesManager: VoyagesManager

	private handleAsyncLoaders(loadAreas: any, loadRoutes: any) {
		let loadersCount = 0
		let loadedCount = 0

		function resolve() {
			loadedCount++
			if (loadersCount === loadedCount) {
				eventBus.dispatch(EventType.Load)
			}	
		}

		if (loadAreas != null) {
			eventBus.register(EventType.AreasLoad, resolve)
			loadersCount++
		}

		if (loadRoutes != null) {
			eventBus.register(EventType.RoutesLoad, resolve)
			loadersCount++
		}
	}

	constructor(props: MapProps) {
		this.handleAsyncLoaders(props.loadAreas, props.loadRoutes)

		const tileLayer = new layer.Tile({
			source: new source.XYZ({
				attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
				crossOrigin: 'anonymous',
				url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}'
			})
		});

		// const tileLayer = new layer.Tile({
		// 	source: new source.OSM()
		// })

		const view = new View({
			center: fromLonLat([5, 53]),
			zoom: 6
		})


		const voyagesManager = new VoyagesManager()
		this.featureManagers.push(new EventsManager(), voyagesManager)
		if (props.loadAreas != null) {
			this.featureManagers.push(new AreasManager(view, props.loadAreas))
		}
		if (props.loadRoutes != null) {
			const routesManager = new RoutesManager(props.loadRoutes)
			this.featureManagers.push(routesManager)
			voyagesManager.routesManager = routesManager
		}

		// const featureLayers = [
		// 	this.voyagesManager.layer,
		// 	this.eventsManager.layer
		// ]

		// TODO move routesManager back to map

		// if (props.loadRoutes != null) {
		// 	featureLayers.push(this.voyagesManager.routesManager.layer)
		// }


		// this.featureLayersGroup = new layer.Group({
		// 	layers: featureLayers,
		// 	name: 'Feature Layers Group'
		// })

		this.popupManager = new PopupManager(view, props.popupElement)

		this.map = new WebGLMap({
			target: props.target,
			layers: [
				tileLayer,
				new layer.Group({
					layers: this.featureManagers.map(man => man.layer),
					name: 'Feature Layers Group'
				})
			],
			overlays: [
				this.popupManager.overlay
			],
			view,
		})
		
		this.select = new Select({
			condition: click, 
			layers: [
				this.featureManagers.map(man => man.layer)
			], 
			multi: true
		})
		this.select.on('select', this.handleClick)
		this.map.addInteraction(this.select)

		// FIXME this keeps on calling
		this.map.on('postcompose', this.animate)

	}

	private animate = (ev: any) => {
		this.featureManagers.forEach(man => man.renderNextFrame(ev.vectorContext))
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

	updateExtent() {
		const theExtent = this.featureManagers.map(man => man.layer).reduce((prev: Extent, curr: layer.Vector) => {
			(extent as any).extend(prev, curr.getSource().getExtent())
			return prev
		}, (extent as any).createEmpty())

		this.map.getView().fit(theExtent, { duration: 100 })
	}

	hidePopup() {
		this.popupManager.hide()
	}

	on(eventName: string, func: any) {
		if (Object.values(EventType).indexOf(eventName) > -1) {
			let realFunc
			// TODO pass feature, see selectEvent
			if (eventName === EventType.Select) realFunc = (ev: any) => func(ev.detail)
			else realFunc = func

			eventBus.register(eventName, realFunc)
		}
	}

	selectEvent(event: Ev3nt) {
		event
		// let feature = this.eventsManager.features.find((f: any) => f.getProperties().event.id === event.id)
		// if (feature == null) {
		// 	feature = this.voyagesManager.features.find((f: any) => f.getProperties().event.id === event.id)
		// }
		// if (feature) {
		// 	this.props.handleEvent([feature])
		// 	this.popupManager.show(feature.getGeometry().getCoordinates())
		// }
	}

	/**
	 * Start animation
	 */
	play() {
		this.featureManagers.forEach(man => man.play())
	}

	/**
	 * Pause animation
	 */
	pause() {
		setTimeout(() => {
			this.featureManagers.forEach(man => man.pause())
			this.map.render()
		}, 100)
	}

	/**
	 * Set the visible events
	 * 
	 * When the timeline changes (zoomed or moved), the visible events change
	 * and are passed to the map.
	 */
	setVisibleEvents(visibleEvents: Ev3nt[], center: number) {
		this.featureManagers.forEach(man => man.setCoordinates(visibleEvents, center))
		this.map.render()
	}

	drawFeatures() {
		this.featureManagers.forEach(man => man.drawFeatures())
	}

	/**
	 * Update the size of the map
	 * 
	 * Method should be called when the container (HTML element) of the map
	 * is changed (not through a resize). This happens for example when the user
	 * toggles between timeline view, timeline/map view and map view.
	 */
	updateSize() {
		this.map.updateSize()
	}
}