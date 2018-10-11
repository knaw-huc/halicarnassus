import styled from "react-emotion"

export function gray(ratio: number) {
	const value = 255 * ratio
	return `rgb(${value}, ${value}, ${value})`
}

export const Button = styled('button')`
	background: none;
	border-radius: 4px;
	border: 2px solid ${gray(.25)};
	color: white;
	cursor: pointer;
	height: 24px; 
	outline: none;
`

export const Select = styled('select')`
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

export const Section = styled('div')`
	align-items: center;
	display: grid;
	grid-gap: 1em;
	padding: 0 1em;
`