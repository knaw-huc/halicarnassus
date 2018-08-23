import * as React from 'react';
import HalicarnassusMap from 'halicarnassus-map';
import Timeline, { TimelineConfig } from 'timeline';
interface Props {
    loadConfig: (el: HTMLElement) => Promise<TimelineConfig>;
}
export declare enum VisibleComponents {
    Both = 0,
    Map = 1,
    Timeline = 2
}
interface State {
    map: HalicarnassusMap;
    timeline: Timeline;
    visibleComponents: VisibleComponents;
    zoomLevel: number;
}
export default class App extends React.PureComponent<Props, State> {
    private timelineConfig;
    private timelineRef;
    state: State;
    constructor(props: Props);
    componentDidMount(): Promise<void>;
    componentDidUpdate(_prevProps: Props, prevState: State): void;
    render(): JSX.Element;
}
export {};
