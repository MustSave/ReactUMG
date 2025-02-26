/*
* Tencent is pleased to support the open source community by making Puerts available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved.
* Puerts is licensed under the BSD 3-Clause License, except for the third-party components listed in the file 'LICENSE' which may be subject to their corresponding license terms.
* This file is subject to the terms and conditions defined in file 'LICENSE', which is part of this source code package.
*/

import * as Reconciler from 'react-reconciler'
import { DefaultEventPriority } from 'react-reconciler/constants'
import * as puerts from 'puerts'
import * as UE from 'ue'

let world: UE.World;

function deepEquals(x: any, y: any) {
    if ( x === y ) return true;

    if (  typeof x !== 'object' || x === null  ||  typeof y !== 'object' || y === null  ) return false;

    for (var p in x) { // all x[p] in y
        if (p == 'children' || p == 'Slot') continue;
        if (!deepEquals(x[p], y[p])) return false;
    }

    for (var p in y) {
        if (p == 'children' || p == 'Slot') continue;
        if (!x.hasOwnProperty(p)) return false;
    }

    return true;
}

declare const exports: {lazyloadComponents:{}}

class UEWidget {
    type: string;
    callbackRemovers: {[key: string] : () => void};
    nativePtr: UE.Widget;
    slot: any;
    nativeSlotPtr: UE.PanelSlot;

    constructor (type: string, props: any) {
        this.type = type;
        this.callbackRemovers = {};
        
        try {
            this.init(type, props);
        } catch(e) {
            console.error("create " + type + " throw " + e);
        }
    }

    init(type: string, props: any) {
        let classPath = exports.lazyloadComponents[type];
        if (classPath) {
            //this.nativePtr = asyncUIManager.CreateComponentByClassPathName(classPath);
            this.nativePtr = UE.NewObject(UE.Class.Load(classPath)) as UE.Widget;
        } else {
            this.nativePtr = new UE[type]();
        }

        let myProps = {};
        for (const key in props) {
            let val = props[key];
            if (key == 'Slot') {
                this.slot = val;
            } else if (typeof val === 'function') {
                this.bind(key, val);
            } else if(key !== 'children') {
                myProps[key] = val;
            }
        }
        //console.log("UEWidget", type, JSON.stringify(myProps))
        puerts.merge(this.nativePtr, myProps);
        //console.log(type + ' inited')
    }
  
    bind(name: string, callback: Function) {
        let nativePtr = this.nativePtr
        let prop = nativePtr[name];
        if (typeof prop.Add === 'function') {
            prop.Add(callback);
            this.callbackRemovers[name] = () => {
                prop.Remove(callback);
            }
        } else if (typeof prop.Bind == 'function') {
            prop.Bind(callback);
            this.callbackRemovers[name] = () => {
                prop.Unbind();
            }
        } else {
            console.warn("unsupport callback " + name);
        }
    }
  
    update(oldProps: any, newProps: any) {
        let myProps = {};
        let propChange = false;
        for(var key in newProps) {
            let oldProp = oldProps[key];
            let newProp = newProps[key];
            if (key != 'children' && oldProp != newProp) {
                if (key == 'Slot') {
                    this.slot = newProp;
                    //console.log("update slot..", this.toJSON());
                    puerts.merge(this.nativeSlotPtr, newProp);
                    UE.UMGManager.SynchronizeSlotProperties(this.nativeSlotPtr)
                } else if (typeof newProp === 'function') {
                    this.unbind(key);
                    this.bind(key, newProp);
                } else {
                    myProps[key] = newProp;
                    propChange = true;
                }
            }
        }
        if (propChange) {
            //console.log("update props", this.toJSON(), JSON.stringify(myProps));
            puerts.merge(this.nativePtr, myProps);
            UE.UMGManager.SynchronizeWidgetProperties(this.nativePtr)
        }
    }
  
    unbind(name: string) {
        let remover = this.callbackRemovers[name];
        this.callbackRemovers[name] = undefined;
        if (remover) {
            remover();
        }
    }
    
    unbindAll() {
        for(var key in this.callbackRemovers) {
            this.callbackRemovers[key]();
        }
        this.callbackRemovers = {};
    }
  
    appendChild(child: UEWidget) {
        let nativeSlot = (this.nativePtr as UE.PanelWidget).AddChild(child.nativePtr);
        //console.log("appendChild", (await this.nativePtr).toJSON(), (await child.nativePtr).toJSON());
        child.nativeSlot = nativeSlot;
    }
    
    removeChild(child: UEWidget) {
        child.unbindAll();
        (this.nativePtr as UE.PanelWidget).RemoveChild(child.nativePtr);
        //console.log("removeChild", (await this.nativePtr).toJSON(), (await child.nativePtr).toJSON())
    }
  
    set nativeSlot(value: UE.PanelSlot) {
        this.nativeSlotPtr = value;
        //console.log('setting nativeSlot', value.toJSON());
        if (this.slot) {
            puerts.merge(this.nativeSlotPtr, this.slot);
            UE.UMGManager.SynchronizeSlotProperties(this.nativeSlotPtr);
        }
    }
}

class UEWidgetRoot {
    nativePtr: UE.ReactWidget;
    Added: boolean;

    constructor(nativePtr: UE.ReactWidget) {
        this.nativePtr = nativePtr;
    }
  
    appendChild(child: UEWidget) {
        let nativeSlot = this.nativePtr.AddChild(child.nativePtr);
        child.nativeSlot = nativeSlot;
    }

    removeChild(child: UEWidget) {
        child.unbindAll();
        this.nativePtr.RemoveChild(child.nativePtr);
    }
  
    addToViewport(z : number) {
        if (!this.Added) {
            this.nativePtr.AddToViewport(z);
            this.Added = true;
        }
    }
    
    removeFromViewport() {
        this.nativePtr.RemoveFromViewport();
    }
    
    getWidget() {
        return this.nativePtr;
    }
}

const reconciler = Reconciler<
    string,         // Type
    unknown,        // Props
    UEWidgetRoot,   // Container
    UEWidget,       // Instance
    UEWidget,       // TextInstance
    unknown,        // SuspenseInstance
    unknown,        // HydratableInstance
    unknown,        // PublicInstance
    {},        // HostContext
    unknown,        // UpdatePayload
    unknown,        // ChildSet
    unknown,        // TimeoutHandle
    unknown         // NoTimeout
> ({
    supportsMutation: true,
    supportsPersistence: false,
    createInstance: function (type: string, props: unknown, rootContainer: UEWidgetRoot, hostContext: {}, internalHandle: Reconciler.OpaqueHandle): UEWidget {
        return new UEWidget(type, props);
    },
    createTextInstance: function (text: string, rootContainer: UEWidgetRoot, hostContext: {}, internalHandle: Reconciler.OpaqueHandle): UEWidget {
        return new UEWidget("TextBlock", {Text: text});
    },
    appendInitialChild: function (parentInstance: UEWidget, child: UEWidget): void {
        parentInstance.appendChild(child);
    },
    appendChild (parent: UEWidget, child: UEWidget) {
        parent.appendChild(child);
    },
    appendChildToContainer (container: UEWidgetRoot, child: UEWidget) {
        container.appendChild(child);
    },
    clearContainer: function(container: UEWidgetRoot) {
        container.removeFromViewport();
    },
    removeChildFromContainer: function (container: UEWidgetRoot, child: UEWidget) {
        child.unbindAll();
        container.removeChild(child);
        console.log('removeChildFromContainer');
    },
    removeChild: function(parent: UEWidget, child: UEWidget) {
        parent.removeChild(child);
    },
    finalizeInitialChildren: function (instance: UEWidget, type: string, props: unknown, rootContainer: UEWidgetRoot, hostContext: {}): boolean {
        return false
    },
    prepareUpdate: function (instance: UEWidget, type: string, oldProps: unknown, newProps: unknown, rootContainer: UEWidgetRoot, hostContext: {}): unknown {
        try{
            return !deepEquals(oldProps, newProps);
        } catch(e) {
            console.error(e.message);
            return true;
        }
    },
    shouldSetTextContent: function (type: string, props: unknown): boolean {
        return false
    },
    getRootHostContext: function (rootContainer: UEWidgetRoot): {} {
        return {};
    },
    getChildHostContext: function (parentHostContext: {}, type: string, rootContainer: UEWidgetRoot): {} {
        return parentHostContext;//no use, share one
    },
    getPublicInstance: function (instance: UEWidget): unknown {
        console.warn('getPublicInstance');
        return instance
    },
    prepareForCommit: function (containerInfo: UEWidgetRoot): Record<string, any> | null {
        //log('prepareForCommit');
        return null;
    },
    resetAfterCommit: function (containerInfo: UEWidgetRoot): void {
        containerInfo.addToViewport(0);
    },
    resetTextContent: function (): void {
        console.error('resetTextContent not implemented!');
    },
    preparePortalMount: function (containerInfo: UEWidgetRoot): void {
        console.error('preparePortalMount not implemented!');

        return;
        throw new Error('Function not implemented.');
    },
    scheduleTimeout: function (fn: (...args: unknown[]) => unknown, delay?: number): unknown {
        console.error('scheduleTimeout not implemented!');

        return{
            fn(...args: unknown[]) {
                return;
            }
        };
        throw new Error('Function not implemented.');
    },
    cancelTimeout: function (id: unknown): void {
        console.error('cancelTimeout not implemented!');

        return;
        throw new Error('Function not implemented.');
    },
    noTimeout: -1,
    isPrimaryRenderer: true,
    getCurrentEventPriority: function (): Reconciler.Lane {
        console.error('getCurrentEventPriority not implemented!');


        return DefaultEventPriority;
        throw new Error('Function not implemented.');
    },
    getInstanceFromNode: function (node: any): Reconciler.Fiber | null | undefined {
        console.error('getInstanceFromNode not implemented!');

        return null;
        throw new Error('Function not implemented.');
    },
    beforeActiveInstanceBlur: function (): void {
        console.error('beforeActiveInstanceBlur not implemented!');

        return;
        throw new Error('Function not implemented.');
    },
    afterActiveInstanceBlur: function (): void {
        console.error('afterActiveInstanceBlur not implemented!');

        return;
        throw new Error('Function not implemented.');
    },
    prepareScopeUpdate: function (scopeInstance: any, instance: any): void {
        console.error('prepareScopeUpdate not implemented!');

        return;
        throw new Error('Function not implemented.');
    }, 
    getInstanceFromScope: function (scopeInstance: any): UEWidget {
        console.error('getInstanceFromScope not implemented!');

        throw new Error('Function not implemented.');
    },
    detachDeletedInstance: function (node: UEWidget): void {
        // console.error('detachDeletedInstance not implemented!');
        return;
        throw new Error('Function not implemented.');
    },
    commitTextUpdate: function(textInstance: UEWidget, oldText: string, newText: string): void {
        if (oldText != newText) {
            textInstance.update({}, {Text: newText})
        }
    },
    commitUpdate: function (instance: UEWidget, updatePayload: any, type : string, oldProps : any, newProps: any) {
        try{
            instance.update(oldProps, newProps);
        } catch(e) {
            console.error("commitUpdate fail!, " + e);
        }
    },
    supportsHydration: false,
});

export const ReactUMG = {
    render: function(reactElement: React.ReactNode) {
        if (world == undefined) {
            throw new Error("init with World first!");
        }
        let root = new UEWidgetRoot(UE.UMGManager.CreateReactWidget(world));
        const container = reconciler.createContainer(
            root, // containerInfo 
            0, // tag
            null, // hydrationCallbacks
            false, // isStrictMode
            null, // concurrentUpdatesByDefaultOverride
            "UMG", // identifierPrefix
            console.error, // onRecoverableError
            null // transitionCallbacks
        );

        reconciler.updateContainer(reactElement, container, null, null);
        return root;
    },
    init: function(inWorld: UE.World) {
        world = inWorld;
    }
}

