// Types
import { Color } from "../../../color";
import { AddArrayFromBuilder, AddChildFromBuilder, EventData, ViewBase } from "../../core/view";
import { TabNavigationBase } from "../tab-navigation-base";
import { TabStripItem } from "../tab-strip-item";
import { TabStripItemEventData, TabStrip as TabStripDefinition } from "./";

// Requires
import {
    backgroundColorProperty, backgroundInternalProperty, booleanConverter,
    colorProperty, CSSType, fontInternalProperty, Property, View
} from "../../core/view";
import { textTransformProperty } from "../../text-base";

export const traceCategory = "TabView";

// Place this on top because the webpack ts-loader doesn't work when export
// is after reference
export const highlightColorProperty = new Property<TabStrip, Color>({ name: "highlightColor", equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });

@CSSType("TabStrip")
export class TabStrip extends View implements TabStripDefinition, AddChildFromBuilder, AddArrayFromBuilder {
    public static itemTapEvent = "itemTap";
    public items: TabStripItem[];
    public isIconSizeFixed: boolean;
    public iosIconRenderingMode: "automatic" | "alwaysOriginal" | "alwaysTemplate";
    public _hasImage: boolean;
    public _hasTitle: boolean;

    public eachChild(callback: (child: ViewBase) => boolean) {
        const items = this.items;
        if (items) {
            items.forEach((item, i) => {
                callback(item);
            });
        }
    }

    public _addArrayFromBuilder(name: string, value: Array<any>) {
        if (name === "items") {
            this.items = value;
        }
    }

    public _addChildFromBuilder(name: string, value: any): void {
        if (name === "TabStripItem") {
            if (!this.items) {
                this.items = new Array<TabStripItem>();
            }
            this.items.push(<TabStripItem>value);
            this._addView(value);
            // selectedIndexProperty.coerce(this);
        }
    }

    public onItemsChanged(oldItems: TabStripItem[], newItems: TabStripItem[]): void {
        if (oldItems) {
            oldItems.forEach(item => this._removeView(item));
        }

        if (newItems) {
            newItems.forEach(item => {
                this._addView(item);
            });
        }
    }

    [backgroundColorProperty.getDefault](): Color {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarBackgroundColor();
    }
    [backgroundColorProperty.setNative](value: Color) {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.setTabBarBackgroundColor(value);
    }

    [backgroundInternalProperty.getDefault](): any {
        return null;
    }
    [backgroundInternalProperty.setNative](value: any) {
        // disable the background CSS properties
    }

    [colorProperty.getDefault](): Color {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarColor();
    }
    [colorProperty.setNative](value: Color) {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.setTabBarColor(value);
    }

    [fontInternalProperty.getDefault](): any {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarFontInternal();
    }
    [fontInternalProperty.setNative](value: any) {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.setTabBarFontInternal(value);
    }

    [textTransformProperty.getDefault](): any {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarTextTransform();
    }
    [textTransformProperty.setNative](value: any) {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.setTabBarTextTransform(value);
    }

    [highlightColorProperty.getDefault](): number {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.getTabBarHighlightColor();
    }
    [highlightColorProperty.setNative](value: number | Color) {
        const parent = <TabNavigationBase>this.parent;

        return parent && parent.setTabBarHighlightColor(value);
    }
}

export interface TabStrip {
    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "itemTap", callback: (args: TabStripItemEventData) => void, thisArg?: any);
}

export const itemsProperty = new Property<TabStrip, TabStripItem[]>({
    name: "items", valueChanged: (target, oldValue, newValue) => {
        target.onItemsChanged(oldValue, newValue);
    }
});
itemsProperty.register(TabStrip);

export const iosIconRenderingModeProperty = new Property<TabStrip, "automatic" | "alwaysOriginal" | "alwaysTemplate">({ name: "iosIconRenderingMode", defaultValue: "automatic" });
iosIconRenderingModeProperty.register(TabStrip);

export const isIconSizeFixedProperty = new Property<TabStrip, boolean>({
    name: "isIconSizeFixed", defaultValue: true, valueConverter: booleanConverter
});
isIconSizeFixedProperty.register(TabStrip);

highlightColorProperty.register(TabStrip);
