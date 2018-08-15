import * as React from 'react'
import { css } from 'react-emotion'
import TimelineConfigManager from './timeline-config-manager';
import HalicarnassusMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'
import Timeline, { OrderedEvents } from 'timeline';
import { DEFAULT_ZOOM_LEVEL } from '../constants'

// TODO if timeline or map is not visible, do not update it when animating (performance improv)
// TODO improve popup
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

export enum VisibleComponents { Both, Map, Timeline }
interface State {
	map: HalicarnassusMap
	timeline: Timeline
	visibleComponents: VisibleComponents
	zoomLevel: number
}
export default class App extends React.PureComponent<null, State> {
	private timeline: Timeline
	private timelineConfigManager: TimelineConfigManager
	private map: HalicarnassusMap

	constructor(props) {
		super(props)

		this.state = {
			map: null,
			timeline: null,
			visibleComponents: VisibleComponents.Both,
			zoomLevel: DEFAULT_ZOOM_LEVEL
		}
	}

	async componentDidMount() {
		const timelineEl = document.getElementById('timeline')
		const viewportWidth = timelineEl.getBoundingClientRect().width
		const response = await fetch(`/api/events?viewportWidth=${viewportWidth}&zoomLevel=${DEFAULT_ZOOM_LEVEL}`)
		const orderedEvents: OrderedEvents = await response.json()

		this.map = new HalicarnassusMap({
			handleEvent: (name, data) => console.log(name, data),
			events: orderedEvents.events,
			target: 'map',
		})

		this.timelineConfigManager = new TimelineConfigManager(timelineEl, orderedEvents)
		this.timeline = new Timeline(
			this.timelineConfigManager.getDefaultConfig(),
			x => {
				const band = x.bands[0]
				if (this.state.zoomLevel !== band.zoomLevel) this.setState({ zoomLevel: band.zoomLevel })
				this.map.setRange({ visibleFrom: band.from, visibleTo: band.to })
			},
			x => this.map.onSelect(x)
		)

		this.setState({
			map: this.map,
			timeline: this.timeline
		})
	}

	componentDidUpdate(_, prevState: State) {
		if (prevState.visibleComponents !== this.state.visibleComponents) {
			this.map.updateSize()
			this.timelineConfigManager.updateConfig(this.state.visibleComponents)
			this.timeline.reload()
		}
	}

	render() {
		return (
			<div className={wrapperClass(this.state.visibleComponents)}>
				<div id="map" />
				<Controls
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
					zoomIn={() => this.state.timeline}
					zoomLevel={this.state.zoomLevel}
					zoomOut={() => this.state.timeline}
				/>
				<div id="timeline" />
			</div>
		)
	}
}

async function go() {
	const iframe = new Iframe({
		root: document.getElementById('iframe-container')
	})
	const iframeLeft = new Iframe({
		root: document.getElementById('iframe-left-container')
	})

	function handleEvent(name, data) {
		if (name === 'OPEN_IFRAME') {
			iframe.src = data
		} else if (name === 'OPEN_IFRAMES') {
			iframeLeft.src = data.leftSrc
			iframe.src = data.rightSrc
		}
	}
	handleEvent

	// const map = new CivslogMap({
	// 	handleEvent,
	// 	events,
	// 	target: 'map',
	// })

	// @ts-ignore
}
go