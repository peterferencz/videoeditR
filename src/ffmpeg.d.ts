export declare global {
    FFmpeg = {
        createFFmpeg,
        fetchFile,
    }
}

export const FS: {
    writeFile: (fileName: string, binaryData: Uint8Array | string) => void,
    readFile: (fileName: string) => Uint8Array,
    readdir: (pathName: string) => string[],
    unlink: (fileName: string) => void,
    mkdir: (fileName: string) => void,
}
type FSMethodNames = { [K in keyof typeof FS]: (typeof FS)[K] extends (...args: any[]) => any ? K : never }[keyof typeof FS];
type FSMethodArgs = { [K in FSMethodNames]: Parameters<(typeof FS)[K]> };
type FSMethodReturn = { [K in FSMethodNames]: ReturnType<(typeof FS)[K]> };
type LogCallback = (logParams: { type: string; message: string }) => any;
type ProgressCallback = (progressParams: { ratio: number }) => any;
export interface CreateFFmpegOptions {
    corePath?: string;
    workerPath?: string;
    wasmPath?: string;
    log?: boolean;
    logger?: LogCallback;
    progress?: ProgressCallback;
    mainName?: string;
}
export interface FFmpeg {
    load(): Promise<void>;
    isLoaded(): boolean;
    run(...args: string[]): Promise<void>;
    FS<Method extends FSMethodNames>(method: Method, ...args: FSMethodArgs[Method]): FSMethodReturn[Method];
    setProgress(progress: ProgressCallback): void;
    setLogger(log: LogCallback): void;
    setLogging(logging: boolean): void;
    exit(): void;
}
export function createFFmpeg(options?: CreateFFmpegOptions): FFmpeg;
export function fetchFile(data: string | Buffer | Blob | File): Promise<Uint8Array>;