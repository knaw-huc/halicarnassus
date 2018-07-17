import * as React from 'react'
import { css } from 'react-emotion'
import Timeline from 'timeline'
import TimelineMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'

// TODO if timeline or map is not visible, do not update it when animating (performance improv)

const wrapperClass = (visible: Visible) => {
	const template = visible === 'map' ?
		'95% 5% 0' :
		visible === 'timeline' ?
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

type Visible = 'both' | 'map' | 'timeline'
interface State {
	map: TimelineMap
	timeline: Timeline
	visible: Visible
}
export default class App extends React.PureComponent<null, State> {
	constructor(props) {
		super(props)

		this.state = {
			map: null,
			timeline: null,
			visible: 'both'
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
			<div className={wrapperClass(this.state.visible)}>
				<div id="map" />
				<Controls
					map={this.state.map}
					timeline={this.state.timeline}
					showBoth={() => this.setState({ visible: 'both' })}
					showMap={() => {
						if (this.state.visible === 'map') this.setState({ visible: 'both' })
						else this.setState({ visible: 'map' })
					}}
					showTimeline={() => {
						if (this.state.visible === 'timeline') this.setState({ visible: 'both' })
						else this.setState({ visible: 'timeline' })
					}}
				/>
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