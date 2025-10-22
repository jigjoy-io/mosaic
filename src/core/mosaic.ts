import { TextGen, ToolUse, Vision } from "./capabilities"

export type AnyCap = Partial<TextGen & ToolUse & Vision>

export type Handle<TCaps extends AnyCap> = Readonly<TCaps> & {
    // common metadata you always expose
    modelLabel: string
}

export class Mosaic<TCaps extends AnyCap = {}> {

    private impls: Partial<AnyCap> = {}
    private label: string

    constructor(label = "composed") { this.label = label }

    withText(impl: TextGen): Mosaic<TCaps & TextGen> {
        (this.impls as any).text = impl.text.bind(impl)
        return this as unknown as Mosaic<TCaps & TextGen>
    }

    withTools(impl: ToolUse): Mosaic<TCaps & ToolUse> {
        (this.impls as any).withTools = impl.withTools.bind(impl)
        return this as unknown as Mosaic<TCaps & ToolUse>
    }

    withVision(impl: Vision): Mosaic<TCaps & Vision> {
        (this.impls as any).vision = impl.vision.bind(impl)
        return this as unknown as Mosaic<TCaps & Vision>
    }

    // decorators are reusable: retry, tracing, budgeting, caching, etc.
    decorate(mutator: (impls: Partial<AnyCap>) => void): this {
        mutator(this.impls)
        return this
    }

    build(): Handle<TCaps> {
        return Object.freeze({ ...this.impls, modelLabel: this.label }) as Handle<TCaps>
    }
}
