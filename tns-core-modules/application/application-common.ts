// Require globals first so that snapshot takes __extends function.
import "../globals";
import { Observable, EventData } from "../data/observable";
import { View } from "../ui/core/view";
import {
    trace as profilingTrace,
    time,
    uptime,
    level as profilingLevel,
} from "../profiling";

const events = new Observable();
let launched = false;
function setLaunched() {
    launched = true;
    events.off("launch", setLaunched);
}
events.on("launch", setLaunched);

if (profilingLevel() > 0) {
    events.on("displayed", () => {
        const duration = uptime();
        const end = time();
        const start = end - duration;
        profilingTrace(`Displayed in ${duration.toFixed(2)}ms`, start, end);
    });
}

export function hasLaunched(): boolean {
    return launched;
}

export { Observable };

import {
    AndroidApplication,
    CssChangedEventData,
    DiscardedErrorEventData,
    iOSApplication,
    LoadAppCSSEventData,
    UnhandledErrorEventData
} from "./application";
import { DeviceOrientation } from "../ui/enums/enums";

export { UnhandledErrorEventData, DiscardedErrorEventData, CssChangedEventData, LoadAppCSSEventData };

export const launchEvent = "launch";
export const suspendEvent = "suspend";
export const displayedEvent = "displayed";
export const resumeEvent = "resume";
export const exitEvent = "exit";
export const lowMemoryEvent = "lowMemory";
export const uncaughtErrorEvent = "uncaughtError";
export const discardedErrorEvent = "discardedError";
export const orientationChangedEvent = "orientationChanged";

export const CSS_CLASS_PREFIX = "ns-";
const ORIENTATION_CSS_CLASSES = [
    `${CSS_CLASS_PREFIX}${DeviceOrientation.portrait}`,
    `${CSS_CLASS_PREFIX}${DeviceOrientation.landscape}`,
    `${CSS_CLASS_PREFIX}${DeviceOrientation.unknown}`
];

let cssFile: string = "./app.css";

let resources: any = {};

export function getResources() {
    return resources;
}

export function setResources(res: any) {
    resources = res;
}

export let android = undefined;
export let ios = undefined;

export const on: typeof events.on = events.on.bind(events);
export const off: typeof events.off = events.off.bind(events);
export const notify: typeof events.notify = events.notify.bind(events);
export const hasListeners: typeof events.hasListeners = events.hasListeners.bind(events);

let app: iOSApplication | AndroidApplication;
export function setApplication(instance: iOSApplication | AndroidApplication): void {
    app = instance;
}

export function livesync(rootView: View, context?: ModuleContext) {
    events.notify(<EventData>{ eventName: "livesync", object: app });
    const liveSyncCore = global.__onLiveSyncCore;
    let reapplyAppStyles = false;

    // ModuleContext is available only for Hot Module Replacement
    if (context && context.path) {
        const styleExtensions = ["css", "scss"];
        const appStylesFullFileName = getCssFileName();
        const appStylesFileName = appStylesFullFileName.substring(0, appStylesFullFileName.lastIndexOf(".") + 1);
        reapplyAppStyles = styleExtensions.some(ext => context.path === appStylesFileName.concat(ext));
    }

    // Handle application styles
    if (rootView && reapplyAppStyles) {
        rootView._onCssStateChange();
    } else if (liveSyncCore) {
        liveSyncCore(context);
    }
}

export function setCssFileName(cssFileName: string) {
    cssFile = cssFileName;
    events.notify(<CssChangedEventData>{ eventName: "cssChanged", object: app, cssFile: cssFileName });
}

export function getCssFileName(): string {
    return cssFile;
}

export function loadAppCss(): void {
    try {
        events.notify(<LoadAppCSSEventData>{ eventName: "loadAppCss", object: app, cssFile: getCssFileName() });
    } catch (e) {
        throw new Error(`The file ${getCssFileName()} couldn't be loaded! ` +
            `You may need to register it inside ./app/vendor.ts.`);
    }
}

export function orientationChanged(rootView: View, newOrientation: "portrait" | "landscape" | "unknown"): void {
    const newOrientationCssClass = `${CSS_CLASS_PREFIX}${newOrientation}`;
    if (!rootView.cssClasses.has(newOrientationCssClass)) {
        ORIENTATION_CSS_CLASSES.forEach(c => rootView.cssClasses.delete(c));
        rootView.cssClasses.add(newOrientationCssClass);
        rootView._onCssStateChange();
    }
}

global.__onUncaughtError = function (error: NativeScriptError) {
    events.notify(<UnhandledErrorEventData>{ eventName: uncaughtErrorEvent, object: app, android: error, ios: error, error: error });
};

global.__onDiscardedError = function (error: NativeScriptError) {
    events.notify(<DiscardedErrorEventData>{ eventName: discardedErrorEvent, object: app, error: error });
};
