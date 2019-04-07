module utils {

    export class Messenger {

        private globalCallbacks: Array<(name: string, param: any) => void> = [];
        private handlerMap: {
            [name: string]: Array<(name: string, param: any) => void>
        } = {};

        constructor() {
        }
        public unsubscribe(callback: (name: string, param: any) => void) {
            let index = this.globalCallbacks.indexOf(callback);
            if (index !== - 1) {
                this.globalCallbacks.splice(index, 1);
            }
        }
        public subscribe(callback: (name: string, param: any) => void): void {
            if (callback) {
                this.globalCallbacks.push(callback);
            }
        }
        public unsubscribeFromEvent<T>(msg: INamedMessage<T>, callback: (name: string, param: T) => void) {
            if (callback) {
                var msgName = msg.name
                var handlers = this.handlerMap[msgName] = this.handlerMap[msgName] || [];
                let index = handlers.indexOf(callback);
                if (index !== - 1) {
                    handlers.splice(index, 1);
                }
            }
        }

        public subscribeToEvent<T>(msg: INamedMessage<T>, callback: (name: string, param: T) => void): void {
            if (callback) {
                var msgName = msg.name
                var handlers = this.handlerMap[msgName] = this.handlerMap[msgName] || [];
                handlers.push(callback);
            }
        }
        public sendMessage<T>(msg: INamedMessage<T>, parameter: T): void {
            var msgName = msg.name;
            this.globalCallbacks
                .concat(this.handlerMap[msgName] || [])
                .forEach(fn => fn(msgName, parameter));
        }

        public getMessage<T>(msg: INamedMessage<T>): IMessageDispatcher<T> {
            return {
                sendMessage: param => this.sendMessage(msg, param),
                subscribe: h => this.subscribeToEvent(msg, h)
            };
        }
    }

    export var messenger = new Messenger();

    export function setMessageName(): PropertyDecorator {
        return (target, msgName) => {
            target[msgName] = { name: msgName };
        }
    }
    export interface INamedMessage<T> {
        name: string
    }

    export interface IMessageDispatcher<T> {
        subscribe(handler: (name: string, param: T) => void): void;
        sendMessage(param: T): void;
    }

    interface IMessageHandlerMapOwner {
        __messageHandlers__: { [name: string]: string[] };
    }

    export function message(msg: INamedMessage<any>): MethodDecorator {
        return (target: IMessageHandlerMapOwner, propName, desc) => {
            let handlerMap = target.__messageHandlers__ = target.__messageHandlers__ || {};
            let handlers: Array<any> = handlerMap[msg.name] = handlerMap[msg.name] || []
            handlers.push(propName);
        };
    }

    export class DecoratedMediator {
        private subscriptions: Array<{
            msgName: string,
            fn: any
        }> = [];
        public constructor(target: any) {
            var owner: IMessageHandlerMapOwner = target;
            var map = owner.__messageHandlers__;
            if (map) {
                for (var msgName in map) {
                    map[msgName].forEach(fn => {
                        var sub = (name, param) => {
                            target[fn](name, param)
                        };
                        utils.messenger.subscribeToEvent({ name: msgName }, sub);
                        this.subscriptions.push({
                            msgName: msgName,
                            fn: sub
                        });
                    });
                }
            }
        }

        destroy() {
            this.subscriptions.forEach(_ => utils.messenger.unsubscribeFromEvent({
                name: _.msgName
            }, _.fn));
        }
    }
}