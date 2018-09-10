import * as React from 'react'
import { Wrapper, ImgWrapper, Img, MetaData, H3, Description, Dates, H4, CloseButton } from './components'
import { RawEv3nt, formatDate } from 'timeline';

interface Props {
	event: RawEv3nt
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
					this.props.event.has_image &&
					<ImgWrapper>
						<Img src={this.props.event.image.src.replace('32', '128')} />
					</ImgWrapper>
				}
				<MetaData>
					<H3>{this.props.event.label}</H3>
					<Description>{this.props.event.description}</Description>
					<Dates>
						<div>
							{
								this.props.event.time > 0 &&
								<H4>From</H4>
							}
							{formatDate(this.props.event.from, this.props.event.date_min_granularity || this.props.event.date_granularity)}
						</div>
						{
							this.props.event.time > 0 &&
							<div>
								<H4>To</H4>
								{formatDate(this.props.event.to, this.props.event.end_date_max_granularity || this.props.event.end_date_granularity)}
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