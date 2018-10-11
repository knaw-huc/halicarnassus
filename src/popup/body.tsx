import * as React from 'react'
import { Wrapper, ImgWrapper, Img, MetaData, H3, Description, Dates, H4, CloseButton } from './components'
import { Ev3nt, formatDate } from 'timeline';

interface Props {
	event: Ev3nt
	forMap: boolean
}
export default class PopupBody extends React.PureComponent<Props> {
	render() {
		return (
			<Wrapper
				event={this.props.event}
				forMap={this.props.forMap}
			>
				{
					this.props.event.img != null &&
					<ImgWrapper>
						<Img src={this.props.event.image.src.replace('32', '128')} />
					</ImgWrapper>
				}
				<MetaData>
					<H3>{this.props.event.lbl}</H3>
					<Description>{this.props.event.dsc}</Description>
					<Dates>
						<div>
							{
								this.props.event.time > 0 &&
								<H4>From</H4>
							}
							{formatDate(this.props.event.from, this.props.event.dmin_g || this.props.event.d_g)}
						</div>
						{
							this.props.event.time > 0 &&
							<div>
								<H4>To</H4>
								{formatDate(this.props.event.to, this.props.event.dmax_g || this.props.event.ed_g)}
							</div>
						}
					</Dates>
				</MetaData>
				<CloseButton id="close-button">✖</CloseButton>
				{ this.props.children }
			</Wrapper>

		)
	}
}