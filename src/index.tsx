import * as React from 'react'
import HalicarnassusMap from './map'
import Controls from './controls'
import Timeline, { TimelineConfig, RawEv3nt } from 'timeline'
import { css } from 'emotion'
import Popup from './map/popup/index'

// TODO open popup with multiple features (now they are ingnored)
// TODO if event selected on map, go to event on timeline
// TODO if timeline or map is not visible, do not update it when animating (performance improv)
// TODO use React to create map ui (popup)
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
	loadConfig: (el: HTMLElement) => Promise<TimelineConfig>
}
export enum VisibleComponents { Both, Map, Timeline }
interface State {
	activeEvent: RawEv3nt,
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
			handleEvent: (features) => {
				console.log(features[0].getProperties().event)
				this.setState({ activeEvent: null, activeFeatures: features })
			},
			popupElement: this.popupRef.current.ref.current,
			target: 'map',
		})

		const timeline = new Timeline(
			this.timelineConfig,
			props => {
				const band = this.timelineConfig.controlBand
				if (this.state.zoomLevel !== band.zoomLevel) this.setState({ zoomLevel: band.zoomLevel })
				this.map.setVisibleEvents(band.visibleEvents, props)
			},
			event => {
				if (event.locs && event.locs.length) {
					this.map.onSelect(event)
					timeline.hidePopup()
				} else {
					this.map.hidePopup()
					timeline.showPopup(event)
				}
			}
		)

		this.setState({ map: this.map, timeline, zoomLevel: this.timelineConfig.controlBand.zoomLevel })
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
