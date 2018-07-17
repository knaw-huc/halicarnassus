import * as React from "react"
import styled from "react-emotion";
import Timeline from "timeline"
import TimelineMap from 'halicarnassus-map'
import Button, { gray } from './button'

// TODO why does Wrapper AND RightSection need padding-rigth?
const Wrapper = styled('div')`
	background: rgb(0, 0, 0);
	border-bottom: 2px solid ${gray(.25)};
	border-top: 2px solid ${gray(.25)};
	display: grid;
	grid-gap: 1em;
	grid-template-columns: 50% 50%;
	padding-right: 1em;
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

const RightSection = styled(Section)`
	justify-content: right;
	grid-template-columns: auto auto auto;
	padding-rigth: 1em;
`

interface Props {
	map: TimelineMap
	timeline: Timeline
	showBoth: () => void
	showMap: () => void
	showTimeline: () => void
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
