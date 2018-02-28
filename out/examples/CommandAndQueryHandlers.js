"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("./User");
const Application_1 = require("../src/Application");
const EventStore_1 = require("../src/EventStore");
class UserRepository {
    constructor(eventStore) {
        this.eventStore = eventStore;
    }
    save(aggregateRoot) {
        this.eventStore.append(aggregateRoot.getAggregateRootId(), aggregateRoot.getUncommitedEvents());
    }
    load(aggregateRootId) {
        return (new User_1.User).fromHistory(this.eventStore.load(aggregateRootId));
    }
}
class OnUserWasCreated extends EventStore_1.EventSubscriber {
    onUserWasCreated(event) {
        console.log(`User ${event.email} was created on ${event.ocurrendOn}`);
    }
}
class OnSayHello extends EventStore_1.EventSubscriber {
    onUserSayHello(event) {
        console.log(`User ${event.email} said: "Hello" at ${event.ocurrendOn}`);
    }
}
class CreateUser {
    constructor(uuid, email) {
        this.uuid = uuid;
        this.email = email;
    }
}
class UserCreateHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    handle(c) {
        const user = (new User_1.User).create(c.uuid, c.email);
        this.userRepository.save(user);
    }
}
class SayHello {
    constructor(uuid) {
        this.uuid = uuid;
    }
}
class SayHelloHandler {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    handle(c) {
        const user = this.userRepository.load(c.uuid);
        console.log(user.sayHello());
        this.userRepository.save(user);
    }
}
class QueryDemo {
}
class DemoQueryHandler {
    handle(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('This is a async return query');
                }, 500);
            });
        });
    }
}
// Provision User Store
let eventBus = new EventStore_1.EventBus();
let onUserWasCreated = new OnUserWasCreated();
let onSayHello = new OnSayHello();
eventBus.attach(User_1.UserWasCreated, onUserWasCreated);
eventBus.attach(User_1.UserSayHello, onSayHello);
const userRepository = new UserRepository(new EventStore_1.InMemoryEventStore(eventBus));
// Provision Bus
let resolver = new Application_1.HandlerResolver();
resolver.addHandler(CreateUser, new UserCreateHandler(userRepository));
resolver.addHandler(SayHello, new SayHelloHandler(userRepository));
resolver.addHandler(QueryDemo, new DemoQueryHandler());
let bus = new Application_1.Bus(resolver);
let userUuid = '11a38b9a-b3da-360f-9353-a5a725514269';
bus.handle(new CreateUser(userUuid, 'lol@lol.com'));
bus.handle(new SayHello(userUuid));
bus.handle(new QueryDemo())
    .then((res) => console.log(res))
    .catch(err => (console.log(err)));
setTimeout(() => console.log('DONE'), 1000);
//# sourceMappingURL=CommandAndQueryHandlers.js.map