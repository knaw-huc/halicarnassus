import styled from "react-emotion"
import { Ev3nt } from 'timeline';

interface Props {
	event: Ev3nt
	forMap: boolean
}
export const Wrapper = styled('div')`
	position: absolute;
	background-color: white;
	-webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
	filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
	padding: 15px;
	border-radius: 10px;
	border: 1px solid #cccccc;
	${props => props.forMap ? 'bottom: 12px;' : ''}
	left: ${props => props.forMap ? '-50' : props.event.left}px;
	${props => props.forMap ? '' : `top: ${props.event.top}px;`}
	min-width: 280px;

	display: grid;
	grid-template-columns: ${(props: Props) => props.event.img != null ? '128px 256px' : '320px'} auto;
	grid-gap: 0 1em;

	&:after, &:before {
		top: 100%;
		border: solid transparent;
		content: " ";
		height: 0;
		width: 0;
		position: absolute;
		pointer-events: none;
	}

	&:after {
		border-top-color: white;
		border-width: 10px;
		left: 48px;
		margin-left: -10px;
	}

	&:before {
		border-top-color: #cccccc;
		border-width: 11px;
		left: 48px;
		margin-left: -11px;
	}
`

export const CloseButton = styled('div')`
	cursor: pointer;
`

export const Img = styled('img')`
	border: 1px solid black;
	border-radius: 6px;
	-webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
	filter: drop-shadow(0 1px 4px rgba(0,0,0,0.2));
`

export const ImgWrapper = styled('div')`
`

export const H3 = styled('h3')`
	font-size: 1.5em;
	margin: 0;
`

export const H4 = styled('h4')`
	display: inline-block;
	margin: 0;
	width: 48px;
`

export const Dates = styled('div')`
	margin-top: 1em;
`

export const Description = styled('div')`
	color: gray;
`

export const MetaData = styled('div')`
`

export const Footer = styled('div')`
	grid-column-start: 1;
	grid-column-end: 3;
	margin-top: 1em;
`

export const Link = styled('a')`
	text-decoration: underline;
	cursor: pointer;
`
