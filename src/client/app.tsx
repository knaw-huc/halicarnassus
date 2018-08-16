import * as React from 'react'
import { css } from 'react-emotion'
import TimelineConfigManager from './timeline-config-manager';
import HalicarnassusMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'
import Timeline, { OrderedEvents } from 'timeline';
import { DEFAULT_ZOOM_LEVEL } from '../constants'

// FIXME only show events that are visible in the timeline (now also events above and below are drawn on the map)
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
	// private timeline: Timeline
	private timelineConfigManager: TimelineConfigManager
	// private map: HalicarnassusMap

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

		const map = new HalicarnassusMap({
			handleEvent: (name, data) => console.log(name, data),
			events: orderedEvents.events,
			target: 'map',
		})

		this.timelineConfigManager = new TimelineConfigManager(timelineEl, orderedEvents)
		const timeline = new Timeline(
			this.timelineConfigManager.getDefaultConfig(),
			x => {
				const band = x.bands[0]
				if (this.state.zoomLevel !== band.zoomLevel) this.setState({ zoomLevel: band.zoomLevel })
				map.setRange({ visibleFrom: band.from, visibleTo: band.to })
			},
			x => map.onSelect(x)
		)

		this.setState({ map, timeline })
	}

	componentDidUpdate(_, prevState: State) {
		if (prevState.visibleComponents !== this.state.visibleComponents) {
			this.state.map.updateSize()
			this.timelineConfigManager.updateConfig(this.state.visibleComponents)
			this.state.timeline.reload()
		}
	}

	render() {
		return (
			<div className={wrapperClass(this.state.visibleComponents)}>
				<div id="map" />
				<Controls
					eventsBand={this.timelineConfigManager ? this.timelineConfigManager.eventsBand : null}
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
					zoomIn={() => this.timelineConfigManager.eventsBand.zoomIn()}
					zoomLevel={this.state.zoomLevel}
					zoomOut={() => this.timelineConfigManager.eventsBand.zoomOut()}
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