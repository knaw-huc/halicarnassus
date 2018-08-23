import * as React from "react";
import Timeline, { EventsBand } from "timeline";
import TimelineMap from 'halicarnassus-map';
interface Props {
    controlBand: EventsBand;
    map: TimelineMap;
    timeline: Timeline;
    showBoth: () => void;
    showMap: () => void;
    showTimeline: () => void;
    zoomIn: () => void;
    zoomLevel: number;
    zoomOut: () => void;
}
export default class Controls extends React.PureComponent<Props> {
    render(): JSX.Element;
    private playBackward;
    private playForward;
}
export {};
