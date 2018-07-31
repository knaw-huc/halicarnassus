import * as React from 'react'
import { css } from 'react-emotion'
import Timeline  from 'timeline'
import TimelineConfigFactory from './timeline-config-factory';
import HalicarnassusMap from 'halicarnassus-map'
import Iframe from './iframe'
import Controls from './controls'
import { OrderedEvents } from 'timeline';

// TODO if timeline or map is not visible, do not update it when animating (performance improv)
// TODO add left, center, right date to controls bar. This is necessary when map is full screen (and animating)
//		better yet: add progress bar! with current date(s) info 
//		better yet: add a second timeline with only minimap and never hide it

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
}
export default class App extends React.PureComponent<null, State> {
	private timeline: Timeline
	private timelineConfigFactory: TimelineConfigFactory
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
		const response = await fetch(`/api/events?viewportWidth=${viewportWidth}&zoomLevel=${6}`)
		const orderedEvents: OrderedEvents = await response.json()

		this.map = new HalicarnassusMap({
			handleEvent: (name, data) => console.log(name, data),
			events: orderedEvents.events,
			target: 'map',
		})

		this.timelineConfigFactory = new TimelineConfigFactory(timelineEl, orderedEvents)
		this.timeline = new Timeline(
			this.timelineConfigFactory.getConfig(this.state.visibleComponents),
			x => this.map.setRange(x),
			x => this.map.onSelect(x)
		)

		this.setState({
			map: this.map,
			timeline: this.timeline
		})
	}

	componentDidUpdate(_prevProps, prevState) {
		if (prevState.visible !== this.state.visibleComponents) {
			this.map.updateSize()
			this.timeline.reload(this.timelineConfigFactory.getConfig(this.state.visibleComponents))
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
					zoomIn={() => this.state.timeline.zoomIn()}
					zoomOut={() => this.state.timeline.zoomOut()}
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