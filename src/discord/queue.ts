const QUEUE_DELAY = 500; // 500 ms

class Queue {
  private static instance: Queue;
  public static getInstance(): Queue {
    if (!Queue.instance) {
      Queue.instance = new Queue();
    }

    return Queue.instance;
  }

  protected queue: queue[] = [];

  private constructor() {
    setInterval(() => { this.queueCheck() }, QUEUE_DELAY);
  }

  private queueCheck() {
    if (this.queue.length > 0) {
      this.queue[0].function(...this.queue[0].args);

      this.queue.shift();
    }
  }

  public add(fun: any_function, args: any[]): void {
    this.queue.push({ function: fun, args: args });
  }
}

export default Queue;