import * as React from 'react'
import HalicarnassusMap from './map'
import Controls from './controls'
import Timeline, { TimelineConfig, Ev3nt, EventsBand, MinimapBand, TimelineProps } from 'timeline'
import { css } from 'emotion'
import Popup from './popup'
import { Routes } from './map/managers/routes';
import { Areas } from './map/managers/areas';

// TODO open popup with multiple features (now they are ingnored)
// TODO if event selected on map, go to event on timeline
// TODO if timeline or map is not visible, do not update it when animating (performance improv)
const wrapperClass = (visibleComponents: VisibleComponents) => {
	const template = visibleComponents === VisibleComponents.Map ?
		'90% 5% 5%' :
		visibleComponents === VisibleComponents.Timeline ?
			'0 5% 95%' :
			'47.5% 5% 47.5%'

	return css`
		display: grid;
		grid-template-rows: ${template};
		height: 100%;
		width: 100%;
		transition: all 1s;
	`
}

interface Props {
	// TODO rename to loadTimelineConfig
	loadConfig: (el: HTMLElement) => Promise<TimelineConfig>,
	loadRoutes?: () => Promise<Routes>,
	loadAreas?: () => Promise<Areas>,
}
enum VisibleComponents { Both, Map, Timeline }
export {
	EventsBand,
	MinimapBand,
	VisibleComponents,
}
interface State {
	activeEvent: Ev3nt,
	activeFeatures: any[],
	map: HalicarnassusMap
	timeline: Timeline
	visibleComponents: VisibleComponents
	zoomLevel: number
}
export default class App extends React.PureComponent<Props, State> {
	private timelineConfig: TimelineConfig = new TimelineConfig()
	private timelineRef: React.RefObject<HTMLDivElement>
	private popupRef: React.RefObject<Popup>
	state: State
	private map: HalicarnassusMap

	constructor(props: Props) {
		super(props)

		this.timelineRef = React.createRef()
		this.popupRef = React.createRef()

		this.state = {
			activeEvent: null,
			activeFeatures: [],
			map: null,
			timeline: null,
			visibleComponents: VisibleComponents.Both,
			zoomLevel: null
		}
	}

	async componentDidMount() {
		this.timelineConfig = await this.props.loadConfig(this.timelineRef.current)

		this.map = new HalicarnassusMap({
			// TODO remove
			handleEvent: (features) => {
				console.error("REMOVE ME")
				this.setState({ activeEvent: null, activeFeatures: features })
			},
			popupElement: this.popupRef.current.ref.current,
			loadRoutes: this.props.loadRoutes,
			loadAreas: this.props.loadAreas,
			target: 'map',
		})

		const timeline = new Timeline(this.timelineConfig)
		timeline.on('centerchange', (props: TimelineProps) => {
			const band = props.controlBand
			if (this.state.zoomLevel !== band.zoomLevel) this.setState({ zoomLevel: band.zoomLevel })
			this.map.setVisibleEvents(timeline.visibleEvents(), timeline.center())
		})
		timeline.on('pause', () => this.map.pause())
		timeline.on('play', () => this.map.play())
		timeline.on('select', (event: Ev3nt) => {
			if (event.locs && event.locs.length) {
				this.map.selectEvent(event)
				timeline.hidePopup()
			} else {
				this.map.hidePopup()
				timeline.showPopup(event)
			}
		})

		this.map.on('load', () => {
			this.map.setVisibleEvents(timeline.visibleEvents(), timeline.center())
			this.map.drawFeatures()
			this.map.updateExtent()
		})

		this.map.on('select', (features: any[]) => {
			this.setState({ activeEvent: null, activeFeatures: features })
		})

		// TODO get controleBand from timeline (timeline.controlBand() (like visibleEvents and center))
		const controlBand = this.timelineConfig.controlBand != null ? this.timelineConfig.controlBand : this.timelineConfig.bands[0]

		this.setState({ map: this.map, timeline, zoomLevel: controlBand.zoomLevel })
	}

	componentDidUpdate(_prevProps: Props, prevState: State) {
		if (prevState.visibleComponents !== this.state.visibleComponents) {
			this.state.map.updateSize()
			// TODO fix
			// this.timelineConfigManager.updateConfig(this.state.visibleComponents)
			// this.props.updateConfig()
			this.state.timeline.reload()
		}
	}

	render() {
		return (
			<div className={wrapperClass(this.state.visibleComponents)}>
				<div id="map" />
				<Controls
					controlBand={this.timelineConfig.controlBand}
					map={this.state.map}
					timeline={this.state.timeline}
					showBoth={() => this.setState({ visibleComponents: VisibleComponents.Both })}
					showMap={() => {
						if (this.state.visibleComponents === VisibleComponents.Map) this.setState({ visibleComponents: VisibleComponents.Both })
						else this.setState({ visibleComponents: VisibleComponents.Map })
					}}
					showTimeline={() => {
						if (this.state.visibleComponents === VisibleComponents.Timeline) this.setState({ visibleComponents: VisibleComponents.Both })
						else this.setState({ visibleComponents: VisibleComponents.Timeline })
					}}
					zoomIn={() => this.timelineConfig.controlBand.zoomIn()}
					zoomLevel={this.state.zoomLevel}
					zoomOut={() => this.timelineConfig.controlBand.zoomOut()}
				/>
				<div ref={this.timelineRef} />
				<Popup
					close={() => this.map.hidePopup()}
					event={this.state.activeEvent}
					ref={this.popupRef}
					features={this.state.activeFeatures}
					setFeatures={activeFeatures => this.setState({ activeFeatures })}
				/>
			</div>
		)
	}
}
