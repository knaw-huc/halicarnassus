import * as React from "react"
import styled from "react-emotion"
import { Button, Section, Select } from './components'
import Timeline from 'timeline';

const LeftSection = styled(Section)`
	grid-template-columns: 24px 24px 24px 72px;
`

interface Props {
	timeline: Timeline
}
export default (props: Props) =>
	<LeftSection>
		<Button onClick={() => props.timeline.animator.playBackward()}>◂</Button>
		<Button
			onClick={() => {
				props.timeline.animator.stop()
			}}
		>
			II
		</Button>
		<Button onClick={() => props.timeline.animator.playForward()}>▸</Button>
		<Select
			defaultValue="1"
			onChange={a => props.timeline.animator.speed(a.target.value)}
		>
			{
				props.timeline.animator.multipliers.map(m =>
					<option key={m} value={m}>{`${m}x`}</option>
				)
			}
		</Select>
	</LeftSection>