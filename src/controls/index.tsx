import * as React from "react"
import styled from "react-emotion"
import Timeline, { EventsBand } from "timeline"
import TimelineMap from '../map'
import { Button, gray, Section, Select } from './components'
import LeftSection from './left-section'

const zoomLevels = [...Array(31).keys()]; // [0, 1, ..., 29, 30]

const Wrapper = styled('div')`
	background: rgb(0, 0, 0);
	border-bottom: 2px solid ${gray(.25)};
	border-top: 2px solid ${gray(.25)};
	display: grid;
	grid-template-columns: 30% 40% 30%;
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
	controlBand: EventsBand
	map: TimelineMap
	timeline: Timeline
	showBoth: () => void
	showMap: () => void
	showTimeline: () => void
	zoomIn: () => void
	zoomLevel: number
	zoomOut: () => void
}
export default (props: Props) => {
	if (props.timeline == null) return <Wrapper />
	return (
		<Wrapper>
			<LeftSection
				timeline={props.timeline}
			/>
			<MiddleSection>
				<Button onClick={props.zoomIn}>+</Button>
				<Button onClick={props.zoomOut}>-</Button>
				<Select
					onChange={a => props.timeline.animator.zoomTo(props.controlBand, parseInt(a.target.value, 10))}
					value={props.zoomLevel.toString()}
				>
					{
						zoomLevels.map(m =>
							<option key={m} value={m}>{`lvl ${m}`}</option>
						)
					}
				</Select>
			</MiddleSection>
			<RightSection>
				<Button onClick={props.showBoth}>m/t</Button>
				<Button onClick={props.showMap}>M</Button>
				<Button onClick={props.showTimeline}>T</Button>
			</RightSection>
		</Wrapper>
	)
}
