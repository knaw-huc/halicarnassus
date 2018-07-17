import styled from "react-emotion"

export function gray(ratio) {
	const value = 255 * ratio
	return `rgb(${value}, ${value}, ${value})`
}

export default styled('button')`
	background: none;
	border-radius: 4px;
	border: 2px solid ${gray(.25)};
	color: white;
	cursor: pointer;
	height: 24px; 
	outline: none;
`