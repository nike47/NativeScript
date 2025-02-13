import * as helper from "../../ui-helper";
import * as TKUnit from "../../tk-unit";

import {
    android,
    getRootView,
    ios
} from "tns-core-modules/application";
import {
    isAndroid,
    device
} from "tns-core-modules/platform";
import { Button } from "tns-core-modules/ui/button/button";
import { Page } from "tns-core-modules/ui/page";
import {
    ShownModallyData,
    ShowModalOptions,
    View
} from "tns-core-modules/ui/frame";
import {
    _rootModalViews
} from "tns-core-modules/ui/core/view/view-common";
import { DeviceType } from "tns-core-modules/ui/enums/enums";

const ROOT_CSS_CLASS = "ns-root";
const MODAL_CSS_CLASS = "ns-modal";
const ANDROID_PLATFORM_CSS_CLASS = "ns-android";
const IOS_PLATFORM_CSS_CLASS = "ns-ios";
const PHONE_DEVICE_TYPE_CSS_CLASS = "ns-phone";
const TABLET_DEVICE_TYPE_CSS_CLASS = "ns-tablet";
const PORTRAIT_ORIENTATION_CSS_CLASS = "ns-portrait";
const LANDSCAPE_ORIENTATION_CSS_CLASS = "ns-landscape";
const UNKNOWN_ORIENTATION_CSS_CLASS = "ns-unknown";

export function test_root_view_root_css_class() {
    const rootViewCssClasses = getRootView().cssClasses;

    TKUnit.assertTrue(rootViewCssClasses.has(
        ROOT_CSS_CLASS),
        `${ROOT_CSS_CLASS} CSS class is missing`
    );
}

export function test_root_view_platform_css_class() {
    const rootViewCssClasses = getRootView().cssClasses;

    if (isAndroid) {
        TKUnit.assertTrue(rootViewCssClasses.has(
            ANDROID_PLATFORM_CSS_CLASS),
            `${ANDROID_PLATFORM_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            IOS_PLATFORM_CSS_CLASS),
            `${IOS_PLATFORM_CSS_CLASS} CSS class is present`
        );
    } else {
        TKUnit.assertTrue(rootViewCssClasses.has(
            IOS_PLATFORM_CSS_CLASS),
            `${IOS_PLATFORM_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            ANDROID_PLATFORM_CSS_CLASS),
            `${ANDROID_PLATFORM_CSS_CLASS} CSS class is present`
        );
    }
}

export function test_root_view_device_type_css_class() {
    const rootViewCssClasses = getRootView().cssClasses;
    const deviceType = device.deviceType;

    if (deviceType === DeviceType.Phone) {
        TKUnit.assertTrue(rootViewCssClasses.has(
            PHONE_DEVICE_TYPE_CSS_CLASS),
            `${PHONE_DEVICE_TYPE_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            TABLET_DEVICE_TYPE_CSS_CLASS),
            `${TABLET_DEVICE_TYPE_CSS_CLASS} CSS class is present`
        );
    } else {
        TKUnit.assertTrue(rootViewCssClasses.has(
            TABLET_DEVICE_TYPE_CSS_CLASS),
            `${TABLET_DEVICE_TYPE_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            PHONE_DEVICE_TYPE_CSS_CLASS),
            `${PHONE_DEVICE_TYPE_CSS_CLASS} CSS class is present`
        );
    }
}

export function test_root_view_orientation_css_class() {
    const rootViewCssClasses = getRootView().cssClasses;
    let appOrientation;

    if (isAndroid) {
        appOrientation = android.orientation;
    } else {
        appOrientation = ios.orientation;
    }

    if (appOrientation === "portrait") {
        TKUnit.assertTrue(rootViewCssClasses.has(
            PORTRAIT_ORIENTATION_CSS_CLASS),
            `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            LANDSCAPE_ORIENTATION_CSS_CLASS),
            `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is present`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            UNKNOWN_ORIENTATION_CSS_CLASS),
            `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is present`
        );
    } else if (appOrientation === "landscape") {
        TKUnit.assertTrue(rootViewCssClasses.has(
            LANDSCAPE_ORIENTATION_CSS_CLASS),
            `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            PORTRAIT_ORIENTATION_CSS_CLASS),
            `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is present`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            UNKNOWN_ORIENTATION_CSS_CLASS),
            `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is present`
        );
    } else if (appOrientation === "landscape") {
        TKUnit.assertTrue(rootViewCssClasses.has(
            UNKNOWN_ORIENTATION_CSS_CLASS),
            `${UNKNOWN_ORIENTATION_CSS_CLASS} CSS class is missing`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            LANDSCAPE_ORIENTATION_CSS_CLASS),
            `${LANDSCAPE_ORIENTATION_CSS_CLASS} CSS class is present`
        );
        TKUnit.assertFalse(rootViewCssClasses.has(
            PORTRAIT_ORIENTATION_CSS_CLASS),
            `${PORTRAIT_ORIENTATION_CSS_CLASS} CSS class is present`
        );
    }
}

export function test_modal_root_view_modal_css_class() {
    let modalClosed = false;

    const modalCloseCallback = function () {
        modalClosed = true;
    };

    const modalPageShownModallyEventHandler = function (args: ShownModallyData) {
        const page = <Page>args.object;
        page.off(View.shownModallyEvent, modalPageShownModallyEventHandler);

        TKUnit.assertTrue(_rootModalViews[0].cssClasses.has(MODAL_CSS_CLASS));
        args.closeCallback();
    };

    const hostNavigatedToEventHandler = function (args) {
        const page = <Page>args.object;
        page.off(Page.navigatedToEvent, hostNavigatedToEventHandler);

        const modalPage = new Page();
        modalPage.on(View.shownModallyEvent, modalPageShownModallyEventHandler);
        const button = <Button>page.content;
        const options: ShowModalOptions = {
            context: {},
            closeCallback: modalCloseCallback,
            fullscreen: false,
            animated: false
        };
        button.showModal(modalPage, options);
    };

    const hostPageFactory = function (): Page {
        const hostPage = new Page();
        hostPage.on(Page.navigatedToEvent, hostNavigatedToEventHandler);

        const button = new Button();
        hostPage.content = button;

        return hostPage;
    };

    helper.navigate(hostPageFactory);
    TKUnit.waitUntilReady(() => modalClosed);
}
