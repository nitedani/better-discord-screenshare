declare const React: any;
export default class ErrorBoundary extends React.Component {
    constructor(props: any);
    componentDidCatch(): void;
    render(): any;
}
export declare function WrapBoundary(Original: any): {
    new (): {
        [x: string]: any;
        render(): any;
    };
    [x: string]: any;
};
export {};
