import * as React from 'react'
import { css } from 'react-emotion'
import TimelineConfigManager from './timeline-config-manager';
import HalicarnassusMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'
import Timeline, { OrderedEvents } from 'timeline';
import { BATTLES_ZOOM_LEVEL } from '../constants'

// FIXME center the map on active event when selecting event in timeline
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

export enum VisibleComponents { Both, Map, Timeline }
interface State {
	map: HalicarnassusMap
	timeline: Timeline
	visibleComponents: VisibleComponents
	zoomLevel: number
}
export default class App extends React.PureComponent<null, State> {
	private timelineConfigManager: TimelineConfigManager

	constructor(props) {
		super(props)

		this.state = {
			map: null,
			timeline: null,
			visibleComponents: VisibleComponents.Both,
			zoomLevel: BATTLES_ZOOM_LEVEL
		}
	}

	async componentDidMount() {
		const timelineEl = document.getElementById('timeline')
		const viewportWidth = timelineEl.getBoundingClientRect().width
		const response = await fetch(`/api/events/11?viewportWidth=${viewportWidth}&zoomLevel=${BATTLES_ZOOM_LEVEL}`)
		const orderedBattles: OrderedEvents = await response.json()

		const map = new HalicarnassusMap({
			handleEvent: (name, data) => console.log(name, data),
			target: 'map',
		})

		const warsResponse = await fetch(`/api/events/14?viewportWidth=${viewportWidth}&zoomLevel=${BATTLES_ZOOM_LEVEL}`)
		const orderedWars: OrderedEvents = await warsResponse.json()

		this.timelineConfigManager = new TimelineConfigManager(timelineEl, orderedBattles, orderedWars)
		const timeline = new Timeline(
			this.timelineConfigManager.getDefaultConfig(),
			x => {
				const band = x.bands.find(b => b.config.label === 'battles')
				if (this.state.zoomLevel !== band.zoomLevel) this.setState({ zoomLevel: band.zoomLevel })
				map.setVisibleEvents(band.visibleEvents)
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
					eventsBand={this.timelineConfigManager ? this.timelineConfigManager.battlesBand : null}
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
					zoomIn={() => this.timelineConfigManager.battlesBand.zoomIn()}
					zoomLevel={this.state.zoomLevel}
					zoomOut={() => this.timelineConfigManager.battlesBand.zoomOut()}
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