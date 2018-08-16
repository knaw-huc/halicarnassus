import * as React from "react"
import styled from "react-emotion"
import Timeline, { EventsBand } from "timeline"
import TimelineMap from 'halicarnassus-map'
import Button, { gray } from './button'

const zoomLevels = [
	0,
	1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
	11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
	21, 22, 23, 24, 25, 26, 27, 28, 29, 30
]

const Wrapper = styled('div')`
	background: rgb(0, 0, 0);
	border-bottom: 2px solid ${gray(.25)};
	border-top: 2px solid ${gray(.25)};
	display: grid;
	grid-template-columns: 30% 40% 30%;
`

const Select = styled('select')`
	background: none;
	border-radius: 4px;
	border: 2px solid ${gray(.25)};
	color: white;
	height: 24px;
	outline: none;

	& option {
		color: #444;
	}
`

const Section = styled('div')`
	align-items: center;
	display: grid;
	grid-gap: 1em;
	padding: 0 1em;
`

const LeftSection = styled(Section)`
	grid-template-columns: 24px 24px 24px 72px;
`

const MiddleSection = styled(Section)`
	justify-content: center;
	grid-template-columns: 24px 24px 72px;
`

const RightSection = styled(Section)`
	justify-content: right;
	grid-template-columns: auto auto auto;
`

interface Props {
	eventsBand: EventsBand
	map: TimelineMap
	timeline: Timeline
	showBoth: () => void
	showMap: () => void
	showTimeline: () => void
	zoomIn: () => void
	zoomLevel: number
	zoomOut: () => void
}
export default class Controls extends React.PureComponent<Props> {
	render() {
		if (this.props.timeline == null) return <Wrapper />
		return (
			<Wrapper>
				<LeftSection>
					<Button onClick={this.playBackward}>◂</Button>
					<Button onClick={() => this.props.timeline.animator.stop()}>II</Button>
					<Button onClick={this.playForward}>▸</Button>
					<Select
						defaultValue="1"
						onChange={a => this.props.timeline.animator.speed(a.target.value)}
					>
						{
							this.props.timeline.animator.multipliers.map(m =>
								<option key={m} value={m}>{`${m}x`}</option>
							)
						}
					</Select>
				</LeftSection>
				<MiddleSection>
					<Button onClick={this.props.zoomIn}>+</Button>
					<Button onClick={this.props.zoomOut}>-</Button>
					<Select
						onChange={a => this.props.timeline.animator.zoomTo(this.props.eventsBand, parseInt(a.target.value, 10))}
						value={this.props.zoomLevel.toString()}
					>
						{
							zoomLevels.map(m =>
								<option key={m} value={m}>{`lvl ${m}`}</option>
							)
						}
					</Select>
				</MiddleSection>
				<RightSection>
					<Button onClick={this.props.showBoth}>m/t</Button>
					<Button onClick={this.props.showMap}>M</Button>
					<Button onClick={this.props.showTimeline}>T</Button>
				</RightSection>
			</Wrapper>
		)
	}

	private playBackward = () => {
		this.props.timeline.animator.playBackward()
	}

	private playForward = () => {
		this.props.timeline.animator.playForward()
	}
}
