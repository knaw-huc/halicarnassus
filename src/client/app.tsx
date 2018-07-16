import * as React from 'react'
import { css } from 'react-emotion'
import Timeline from 'timeline'
import TimelineMap from 'civslog-map'
import Iframe from './iframe'
import Controls from './controls'

const wrapperClass = css`
	display: grid;
	grid-template-rows: 47.5% 5% 47.5%;
	height: 100%;
	width: 100%;
`

interface State {
	map: TimelineMap
	timeline: Timeline
}
export default class App extends React.PureComponent<null, State> {
	constructor(props) {
		super(props)

		this.state = {
			map: null,
			timeline: null
		}
	}

	async componentDidMount() {
		const timelineEl = document.getElementById('timeline')
		const viewportWidth = timelineEl.getBoundingClientRect().width
		const response = await fetch(`/api/events?viewportWidth=${viewportWidth}&visibleRatio=.01`)
		const [events, from, to, /* grid */, rowCount] = await response.json()

		const map = this.initMap(events)

		const timeline = this.initTimeline(timelineEl, events, from, to, rowCount)
		timeline.init(x => map.setRange(x))
		timeline.change(x => map.setRange(x))

		this.setState({ map, timeline })
	}

	render() {
		return (
			<div className={wrapperClass}>
				<div id="map" />
				<Controls map={this.state.map} timeline={this.state.timeline} />
				<div id="timeline" />
			</div>
		)
	}

	private initMap(events): TimelineMap {
		return new TimelineMap({
			handleEvent: (name, data) => console.log(name, data),
			events,
			target: 'map',
		})
	}

	private initTimeline(rootElement, events, from, to, rowCount): Timeline {
		return new Timeline({
			// handleEvent,
			domains: [
				{
					components: new Set(['EVENTS' as 'EVENTS', 'RULERS' as 'RULERS']),
					heightRatio: .75,
					visibleRatio: .01,
				},
				{
					components: new Set(['MINIMAP' as 'MINIMAP', 'RULERS' as 'RULERS']),
					hasIndicatorFor: 0,
					heightRatio: .125,
					topOffsetRatio: .75,
					visibleRatio: .05
				},
				{	
					components: new Set(['MINIMAP' as 'MINIMAP', 'RULERS' as 'RULERS']),
					hasIndicatorFor: 0,
					heightRatio: .125,
					topOffsetRatio: .875,
				},
			],
			from,
			events,
			rootElement,
			rowCount,
			to,
		})
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