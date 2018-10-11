// @ts-ignore
import Overlay from 'ol/Overlay'
// @ts-ignore
import View from 'ol/View'

export default class PopupManager {
	overlay: ol.Overlay = new Overlay({ id: 'popup' })

	constructor(private view: View, el: HTMLDivElement) {
		this.overlay.setElement(el)
	}

	hide() {
		this.overlay.setPosition(null)
	}

	show(coordinates: any) {
		console.log(coordinates)
		this.view.animate({
			center: coordinates,
			duration: 250
		})
		this.overlay.setPosition(coordinates)
	}
}