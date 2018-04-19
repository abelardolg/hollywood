import DomainEvent from "../../Domain/Event/DomainEvent";

export default abstract class EventSubscriber {

    public on(event: DomainEvent): void {
        if (this["on" + (event as any).constructor.name]) {
            this["on" + (event as any).constructor.name](event);
        }
    }
}
