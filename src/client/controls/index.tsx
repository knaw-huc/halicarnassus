import * as React from "react"
import styled from "react-emotion";
import Timeline from "timeline"
import TimelineMap from 'civslog-map'
import Button, { gray } from './button'

const Wrapper = styled('div')`
	align-items: center;
	background: rgb(0, 0, 0);
	border-bottom: 2px solid ${gray(.25)};
	border-top: 2px solid ${gray(.25)};
	display: grid;
	grid-gap: 1em;
	grid-template-columns: 24px 24px 24px 72px;
	padding-left: 1em;
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

interface Props {
	map: TimelineMap
	timeline: Timeline
}
export default class Controls extends React.PureComponent<Props> {
	render() {
		if (this.props.timeline == null) return <Wrapper />
		return (
			<Wrapper>
				<Button onClick={this.playBackward}>◂</Button>
				<Button onClick={() => this.props.timeline.animator.stop()}>II</Button>
				<Button onClick={this.playForward}>▸</Button>
				<Select
					defaultValue="1x"
					onChange={a => this.props.timeline.animator.speed(a.target.value)}
				>
					{
						this.props.timeline.animator.multipliers.map(m =>
							<option key={m} value={m}>{`${m}x`}</option>
						)
					}
				</Select>
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
