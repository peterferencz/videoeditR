import { VideoEditR } from "./index";
import Scene from "./Scene";

export class Renderer{
    private canvas:HTMLCanvasElement;
    private bottombar:HTMLElement[];
    
    private currentFrame = 0;
    private allFrames:number|undefined
    private scenes:Scene[]
    private indexedScenes:[number,Scene][] = []
    private isRendering:boolean = false
    private fps:number = 1
    private ffmpeg
    private FFmpegStatus:FFmpegStatus = FFmpegStatus.loading

    

    constructor(){
        this.bottombar = [
            document.getElementById("info-left")!,
            document.getElementById("info-mid")!,
            document.getElementById("info-right")!
        ]
        this.canvas = <HTMLCanvasElement>document.createElement("canvas")
        document.body.appendChild(this.canvas)
        window.ctx = this.canvas.getContext('2d')!

        this.scenes = []
        //@ts-expect-error
        this.ffmpeg = FFmpeg.createFFmpeg({
            log: true,
            //@ts-expect-error
            progress: p => this.updateFFmpegStatus(FFmpegStatus.renderingVideo, p.ratio*100)
        })
        this.updateFFmpegStatus(FFmpegStatus.loading)
        ;(async () => {
            this.isRendering = true
            await this.ffmpeg.load()
            this.isRendering = false
            this.updateFFmpegStatus(FFmpegStatus.idle)
        })()
    }

    bootstrap(options:VideoEditR.bootstrapOptions) {
        console.log("bootstrapping")
        this.canvas.width = options.resolution.width;
        this.canvas.height = options.resolution.height;
        this.onBootstrap(options)
    }

    private onBootstrap(options:VideoEditR.bootstrapOptions){
        console.log("Renderer load")
        this.currentFrame = 0
        this.allFrames = 0
        this.scenes = []
        this.fps = options.fps

        for (let i = 0; i < options.scenes.length; i++) {
            const generator = options.scenes[i];
            const scene = new Scene(generator)
            this.scenes.push(scene)
            this.indexedScenes.push([this.allFrames, scene])
            this.allFrames += scene.getDuration()
        }
        
        this.Draw()
        this.updateBottombar()
    }

    private updateFFmpegStatus(status:FFmpegStatus, n:number=-1){
        this.FFmpegStatus = status
        const obj = {
            loading: () => `loading`,
            idle: () => `idle`,
            renderingFrames: () => `f[${n}/${this.allFrames!-1}]`,
            renderingVideo: () => `r[${n}]`, //TODO percent
            fscleanup: () => `c[${n}/${this.allFrames}]`,
        }
        if(status == FFmpegStatus.renderingVideo){
            console.log(n)
        }
        //@ts-ignore
        this.bottombar[2].textContent = `ffmpeg[${obj[status.toString()]()}]`
    }

    private updateBottombar(){
        this.bottombar[0].textContent = 
            `f[${this.currentFrame}/${this.allFrames}], s[${this.getCurrentSceneIndex()}/${this.scenes.length}]`
        this.bottombar[1].textContent = `Video editR, v[0.0.1]`
        // this.updateFFmpegStatus()
    }

    Draw(){
        window.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        const currentScene = this.getCurrentScene()
        currentScene[1].ClearElements()

        const generator = currentScene[1].getGenerator()(currentScene[1])
        for (let i = 0; i < this.currentFrame - currentScene[0] + 1; i++) {
            generator.next()
        }

        currentScene[1].Draw()
    }

    async Render(type:"mp4"|"gif"){
        if(this.isRendering||this.allFrames==undefined) return;
        this.isRendering = true;
        for (let i = 0; i < this.allFrames!; i++) {
            this.updateFFmpegStatus(FFmpegStatus.renderingFrames, i)
            this.setFrame(i)

            
            const url = this.canvas.toDataURL("image/jpeg");
            //@ts-expect-error
            await this.ffmpeg.FS("writeFile", `${i.toString().padStart(5, 0)}.jpg`, await FFmpeg.fetchFile(url))
        }

        if(type=="mp4"){
            await this.ffmpeg.run('-framerate', this.fps,
                              '-pattern_type', 'glob',
                              '-i', '*.jpg',
                              //'-s', `${this.resolution[0]}x${this.resolution[1]}`,
                              '-c:a', 'copy',
                              '-shortest',
                              '-c:v', 'libx264',
                              '-pix_fmt', 'yuv420p',
                              `out.${type}`)
        }else{
            await this.ffmpeg.run('-framerate', this.fps,
                              '-pattern_type', 'glob',
                              '-i', '*.jpg',
                            //   '-c:a', 'copy',
                            //   '-shortest',
                            //   '-c:v', 'libx264',
                            //   '-pix_fmt', 'yuv420p',
                            '-f', 'gif',
                            `out.gif`) //FIXME not working :(
        }
        const output = this.ffmpeg.FS("readFile", `out.${type}`)
        const fileReader = new FileReader()
        fileReader.onload = (e) => {
            const url = e.target!.result
            console.log(url)
            
            const output = window.open()
            if(type == "mp4"){
                output?.document.write(`<style>*{margin:0;padding:0;background:black;}video{width:100vw;height:100vh;}</style><video controls><source tpye="video/mp4" src="${url}"></video>`)
            }else{
                output?.document.write(`<style>*{margin:0;padding:0;background:black;}img{width:100vw;height:100vh;background-size:contain;}</style><img src="${url}"/>`)
            }
        }
        const blob = new Blob([output.buffer], { type: "video/mp4" });
        fileReader.readAsDataURL(blob)

        for (let i = 0; i < this.allFrames; i++) {
            //@ts-ignore
            this.ffmpeg.FS('unlink', `${i.toString().padStart(5, 0)}.jpg`)
            this.updateFFmpegStatus(FFmpegStatus.fscleanup, i)
        }
        this.isRendering = false
        this.updateFFmpegStatus(FFmpegStatus.idle)
    }

    private getCurrentScene(){
        for (let i = 0; i < this.indexedScenes.length; i++) {
            const item = this.indexedScenes[i];
            if (this.currentFrame < item[0]) return this.indexedScenes[i-1];
        }
        return this.indexedScenes[this.indexedScenes.length-1]
    }
    private getCurrentSceneIndex(){ //TODO mismatch with ui
        for (let i = 0; i < this.indexedScenes.length; i++) {
            const item = this.indexedScenes[i];
            if (this.currentFrame <= item[0]) return i;
        }
        return this.indexedScenes.length-1
    }

    private setFrame(n:number|undefined){
        if(this.allFrames == null || n == undefined) return;
        this.currentFrame = Math.max(0, Math.min(n, this.allFrames))
        this.Draw()
        this.updateBottombar()
    }

    //#region navigation

    nextFrame(){
        if(this.isRendering) return;
        this.setFrame(this.currentFrame+1)
        this.Draw()
    }
    
    prevFrame(){
        if(this.isRendering) return;
        this.setFrame(this.currentFrame-1)
        this.Draw()
    }
    
    prevScene(){
        if(this.isRendering) return;
        const currentSceneIndex = this.getCurrentSceneIndex()
        if(currentSceneIndex == 0){
            this.setFrame(0)
        }else{
            this.setFrame(this.indexedScenes[currentSceneIndex-1][0])
        }
    }
    
    nextScene(){
        if(this.isRendering) return;
        const currentSceneIndex = this.getCurrentSceneIndex()
        if(currentSceneIndex == this.indexedScenes.length-1){
            this.setFrame(this.allFrames)
        }else{
            console.log(currentSceneIndex, this.indexedScenes.length-1)
            this.setFrame(this.indexedScenes[currentSceneIndex+1][0])
        }
    }
    
    typeNumber(n:number){
        if(this.isRendering) return;
        this.setFrame(parseInt(this.currentFrame.toString()+n))
    }
    
    typeNumberBackspace(){
        if(this.isRendering) return;
        if(this.currentFrame.toString().length == 1){
            this.setFrame(0)
        }else{
            this.setFrame(parseInt(this.currentFrame.toString().slice(0,-1)))
        }
    }

    //#endregion
}

// enum FFmpegStatus {loading,idle,renderingFrames,renderingVideo,fscleanup}
enum FFmpegStatus {loading="loading",idle="idle",renderingFrames="renderingFrames",renderingVideo="renderingVideo",fscleanup="fscleanup"}