import { CLASS_PREFIX } from "./constants";
// @ts-ignore
import Feature from 'ol/Feature'
// @ts-ignore
import Overlay from 'ol/Overlay'
// @ts-ignore
import { transform } from 'ol/proj'
import { formatDate, RawEv3nt } from 'timeline'

export default class Popup {
	closeButton: HTMLElement
	content: HTMLElement
	currentFeatures: any[]
	el: HTMLElement
	syncing: boolean = false
	// event: any

	constructor(private overlay: any) {
		this.el = document.createElement('div')
		this.el.classList.add(`${CLASS_PREFIX}popup`)

		this.closeButton = document.createElement('a')
		this.closeButton.textContent = '✖'
		this.closeButton.addEventListener('click', () => {
			if (this.overlay != null) this.overlay.setPosition(undefined)
		})
		this.el.appendChild(this.closeButton)

		this.content = document.createElement('div')
		this.content.addEventListener('click', this.handleClick)
		this.el.appendChild(this.content)
	}

	hide() {
		this.currentFeatures = null
		this.overlay.setPosition(undefined)
	}

	show(features: any[]) {
		this.currentFeatures = features
		if (this.overlay == null) return console.error('[Popup.show] No overlay')

		if (features.length === 1) {
			this.content.innerHTML = this.singleFeatureTemplate(features[0])
		} else {
			this.content.innerHTML = this.multipleFeaturesTemplate(features)
		}

		this.overlay.setPosition(features[0].getGeometry().getCoordinates())
	}

	private handleClick = async (ev: MouseEvent) => {
		if (this.syncing) return

		const target = ev.target as HTMLElement
		if (target.matches('[data-id] *')) {
			const li = target.closest('[data-id]') as HTMLLIElement
			const feature = this.currentFeatures.find(f => f.getId() === li.dataset.id)
			if (feature != null) this.show([feature])
		}
		else if (target.matches('.sync')) {
			this.syncing = true

			const response = await fetch(`/api/events/${target.dataset.wikidataId}`, { method: 'POST' })
			const json = await response.json()

			if (this.currentFeatures.length > 1) {
				console.error('Sync can only occur when there is one current feature')
				return
			}
			this.currentFeatures[0].setProperties({
				event: json
			})

			this.show(this.currentFeatures)

			this.syncing = false
		}
	}

	private featureListItem = (feature: any): any => {
		const { event } = feature.getProperties()
		return `<li data-id="${feature.getId()}">
			<div>${event.label}</div>
			<div>${this.formatFrom(event)}</div>
			<div>${this.formatTo(event)}</div>
		</li>`
	}

	private multipleFeaturesTemplate(features: any[]): any {
		return `<h3 style="font-size: 1.5em">Multiple events</h3>
			<ul>
				${features.map(this.featureListItem).join('')}
			</ul>
			`.replace(/\>(\\n|\s+)\</g, '><')
	}

	private formatFrom(event: RawEv3nt): string {
		const date = formatDate(event.date, event.date_granularity)
		return event.date_min != null ?
			`${formatDate(event.date_min, event.date_min_granularity)} ~ ${date}` :
			date

	}

	private formatTo(event: RawEv3nt): string {
		return event.end_date_max != null ?
			`${formatDate(event.end_date, event.end_date_granularity)} ~ ${formatDate(event.end_date_max, event.end_date_max_granularity)}` :
			event.end_date != null ?
				formatDate(event.end_date, event.end_date_granularity) :
				''
	}

	private singleFeatureTemplate(feature: any): string {
		const featureProps = feature.getProperties()
		const { event } = featureProps

		const description = event.description != null ? `<div class="description">${event.description}</div>` : ''

		const from = this.formatFrom(event)
		const to = this.formatTo(event)

		return `<h3 style="font-size: 1.5em">${event.label}</h3>
			${description}
			<h4 style="margin-bottom: 0">${to === '' ? 'Date' : 'From'}</h4>
			${from}
			${to !== '' ? `<h4 style="margin-bottom: 0">To</h4>` : ''}
			${to}
			<div class="wikidata-id">
				<a href="https://www.wikidata.org/wiki/${event.wikidata_identifier}">
					Edit on Wikidata
				</a>
				&nbsp;&nbsp;
				<span style="text-decoration: underline; cursor: pointer;" class="sync" data-wikidata-id="${event.wikidata_identifier}">
					Sync with Wikidata
				</span>
			</div>
			`.replace(/\>(\\n|\s+)\</g, '><')
	}
}
