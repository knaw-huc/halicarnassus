// @ts-ignore
// import * as source from 'ol/source'
// @ts-ignore
// import * as layer from 'ol/layer'
import { Ev3nt } from 'timeline';

export default abstract class FeatureManager {
	source: any/*source.Vector*/
	features: any[] = []
	layer: any/*layer.Vector*/

	play() {
		this.source.clear()
	}

	pause() {
		this.drawFeatures()
		this.features = []
	}

	/**
	 * Draw the 'real' features on the source
	 * 
	 * This method is called when the map is initialized or
	 * when the animation has stopped
	 */
	drawFeatures() {
		this.source.clear()
		this.source.addFeatures(this.features)
	}

	abstract renderNextFrame(vectorContext: any): void
	abstract setCoordinates(events: Ev3nt[], center: number): void
}