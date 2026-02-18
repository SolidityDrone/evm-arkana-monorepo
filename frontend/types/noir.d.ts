declare module '@noir-lang/noir_js' {
    export class Noir {
        constructor(circuit: { bytecode: any }, options?: {
            foreignCallHandler?: (name: string, args: any[]) => Promise<any>;
        });
        execute(inputs: any, foreignCallHandler?: (name: string, args: any[]) => Promise<any>): Promise<{ witness: any }>;
    }
}

<｜tool▁call▁end｜><｜tool▁call▁begin｜>
TodoWrite
