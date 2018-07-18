import * as React from 'react'
import { css } from 'react-emotion'
import Timeline from 'timeline'
import HalicarnassusMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'

// TODO if timeline or map is not visible, do not update it when animating (performance improv)

const wrapperClass = (visibleComponents: VisibleComponents) => {
	const template = visibleComponents === VisibleComponents.Map ?
		'95% 5% 0' :
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

enum VisibleComponents { Both, Map, Timeline }
interface State {
	map: HalicarnassusMap
	timeline: Timeline
	visibleComponents: VisibleComponents
}
export default class App extends React.PureComponent<null, State> {
	private timeline: Timeline
	private map: HalicarnassusMap

	constructor(props) {
		super(props)

		this.state = {
			map: null,
			timeline: null,
			visibleComponents: VisibleComponents.Both
		}
	}

	async componentDidMount() {
		const timelineEl = document.getElementById('timeline')
		const viewportWidth = timelineEl.getBoundingClientRect().width
		const response = await fetch(`/api/events?viewportWidth=${viewportWidth}&visibleRatio=.01`)
		const [events, from, to, /* grid */, rowCount] = await response.json()

		this.map = this.initMap(events)

		this.timeline = this.initTimeline(timelineEl, events, from, to, rowCount)
		this.timeline.init(x => this.map.setRange(x))
		this.timeline.change(x => this.map.setRange(x))

		this.setState({
			map: this.map,
			timeline: this.timeline
		})
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.visible !== this.state.visibleComponents) {
			this.map.updateSize()
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
				/>
				<div id="timeline" />
			</div>
		)
	}

	private initMap(events): HalicarnassusMap {
		return new HalicarnassusMap({
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