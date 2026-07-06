declare module 'flexsearch' {
  class Index {
    constructor(options?: any)
    add(id: number | string, content: string): void
    add(content: string): void
    search(query: string, options?: any): any
    remove(id: number | string): void
    update(id: number | string, content: string): void
    clear(): void
    info(): any
    export(): any
    import(data: any): void
  }

  class Document {
    constructor(options?: any)
    add(doc: any): void
    search(query: string, options?: any): any
    remove(id: number | string): void
    update(id: number | string, doc: any): void
    clear(): void
    export(): any
    import(data: any): void
  }

  class Worker {
    constructor(options?: any)
    add(id: number | string, content: string): void
    search(query: string, options?: any): Promise<any>
    remove(id: number | string): void
    clear(): void
  }

  const index: typeof Index
  const document: typeof Document
  const worker: typeof Worker

  export { Index, Document, Worker, index, document, worker }
  export default { Index, Document, Worker, index, document, worker }
}
