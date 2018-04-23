export interface IframeProps {
	root: HTMLElement
}
export default class Iframe {
	iframe: HTMLIFrameElement

	set src(src: string) {
		this.iframe.src = src
		this.show()
	}

	constructor(private props: IframeProps) {
		this.hide()
		this.props.root.innerHTML = this.template()
		this.iframe = props.root.getElementsByTagName('iframe')[0]
		this.props.root.addEventListener('click', (ev) => {
			if (ev.target.matches('ul.menu li.close')) {
				this.hide()
				this.iframe.src = ''
			}
		})
	}

	show() {
		this.props.root.style.display = 'block'	
	}

	hide() {
		this.props.root.style.display = 'none'
	}

	private template() {
		return `
			<ul class="menu">
				<li class="close">✖</li>
			</ul>
			<iframe></iframe>`
	}
}