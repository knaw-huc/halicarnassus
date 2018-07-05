import CivslogMap from 'civslog-map'
import Timeline from 'timeline'
import Iframe from './iframe'

async function go() {
	const iframe = new Iframe({
		root: document.getElementById('iframe-container')
	})
	const iframeLeft = new Iframe({
		root: document.getElementById('iframe-left-container')
	})
	const timelineEl = document.getElementById('timeline')
	const viewportWidth = timelineEl.getBoundingClientRect().width

	const response = await fetch(`/api/events?viewportWidth=${viewportWidth}&visibleRatio=.01`)
	const [events, from, to, /* grid */, rowCount] = await response.json()

	function handleEvent(name, data) {
		if (name === 'OPEN_IFRAME') {
			iframe.src = data
		} else if (name === 'OPEN_IFRAMES') {
			iframeLeft.src = data.leftSrc
			iframe.src = data.rightSrc
		}
	}

	const map = new CivslogMap({
		handleEvent,
		events,
		target: 'map',
	})

	const timeline = new Timeline({
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
		rootElement: timelineEl,
		rowCount,
		to,
	})
	timeline.change(x => map.setRange(x))
}

document.addEventListener('DOMContentLoaded', (ev) => {
	go()
})