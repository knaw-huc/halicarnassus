import * as React from 'react'
import { Ev3nt } from 'timeline';
import PopupBody from './body'
import { Footer } from './components';

interface Props {
	close: () => void
	event: Ev3nt
	features: any[]
	setFeatures: (af: any[]) => void
}
interface State {
	height: number
	syncing: boolean
}
export default class Popup extends React.PureComponent<Props, State> {
	ref: React.RefObject<HTMLDivElement>

	constructor(props: Props) {
		super(props)
		this.ref = React.createRef()
		this.state = {
			height: 0,
			syncing: false,
		}
	}

	// OpenLayers captures the click event, so React does not receive it.
	// If we tell OpenLayers to stopEvent: false, React receives the event,
	// but every interaction with the popup is also used by OpenLayers (click marker, move to part of map, etc)
	componentDidMount(): any {
		if (this.ref.current) this.ref.current.addEventListener('click', this.handleClick)
		return null
	}

	componentWillUnmount() {
		if (this.ref.current) this.ref.current.removeEventListener('click', this.handleClick)
	}

	render() {
		const events: Ev3nt[] = this.props.features.map(feature =>
			feature.getProperties().event
		)

		const event = events.length ? events[0] : this.props.event

		return (
			<div ref={this.ref}>
				{
					event != null &&
					<PopupBody event={event} forMap={events.length > 0}>
						<Footer>
							<a href={`https://www.wikidata.org/wiki/${event.wid}`}>
								Edit on Wikidata
							</a>
							&nbsp;&nbsp;
							{
								this.state.syncing ?
									<span>Syncing</span> :
									<a id="sync-button" href="#" data-id={event.wid}>
										Sync with Wikidata
									</a>
							}
						</Footer>
					</PopupBody>
				}
			</div>
		)
	}

	private handleClick = (ev: MouseEvent) => {
		const id = (ev.target as HTMLElement).id

		if (id === 'sync-button') this.syncWithWikidata(ev)
		else if (id === 'close-button') this.props.close()
	}

	// FIXME this is not Halicarnassus but CivsLog specific
	private syncWithWikidata = async (ev: MouseEvent) => {
		ev.preventDefault()

		this.setState({ syncing: true })

		const id = (ev.target as HTMLElement).dataset.id
		if (!id) return

		const response = await fetch(`/api/events/by-wikidata-id/${id}`, { method: 'POST' })
		const nextEvent: Ev3nt = await response.json()

		const features = this.props.features.map(f => {
			const featureProps = f.getProperties()
			if (featureProps.event.wikidata_identifier === id) {
				f.setProperties({ event: { ...featureProps.event, ...nextEvent }})
			}
			return f
		})

		this.props.setFeatures(features)

		this.setState({ syncing: false })
	}
}