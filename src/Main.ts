//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends eui.UILayer {

    private drawPen: egret.Shape = new egret.Shape;
    private speed: number = 30;
    private tm: number = Date.now();

    private img_1: egret.Bitmap;
    private img_2: egret.Bitmap;
    protected createChildren(): void {
        super.createChildren();

        egret.lifecycle.addLifecycleListener((context) => {
            // custom lifecycle plugin
        })

        egret.lifecycle.onPause = () => {
            egret.ticker.pause();
        }

        egret.lifecycle.onResume = () => {
            egret.ticker.resume();
        }

        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());


        this.runGame().catch(e => {
            console.log(e);
        })
    }

    private async runGame() {
        await this.loadResource()
        this.createGameScene();
        const result = await RES.getResAsync("description_json")
        await platform.login();
        const userInfo = await platform.getUserInfo();
        console.log(userInfo);
        this.addEventListener(egret.Event.ENTER_FRAME,this.enterFrame,this);

    }
    // 每帧调用
    private enterFrame(e: egret.Event): void{
        let lastTm = Date.now() - this.tm;
        if(this.img_1) {
            this.img_1.rotation += lastTm / 1000 * this.speed;
            let d = this.drawImg(this.img_1);
            let len = this.img_1.parent.numChildren;
            this.addChildAt(d,len - 1);
            this.tm = Date.now();

            const points1 = CollisionUitls.getRectangleVerPoints(this.img_1);
            const points2 = CollisionUitls.getRectangleVerPoints(this.img_2);
            // 检测多边形碰撞
            if (CollisionUitls.checkPolygon(points1, points2)) {
                console.log("icon1 intersects  icon2 !!!!");
            }
        }
        // this.
    }
    private async loadResource() {
        try {
            const loadingView = new LoadingUI();
            this.stage.addChild(loadingView);
            await RES.loadConfig("resource/default.res.json", "resource/");
            await this.loadTheme();
            await RES.loadGroup("preload", 0, loadingView);
            this.stage.removeChild(loadingView);
        }
        catch (e) {
            console.error(e);
        }
    }

    private loadTheme() {
        return new Promise((resolve, reject) => {
            // load skin theme configuration file, you can manually modify the file. And replace the default skin.
            //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
            let theme = new eui.Theme("resource/default.thm.json", this.stage);
            theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                resolve();
            }, this);

        })
    }

    private textfield: egret.TextField;
    /**
     * 创建场景界面
     * Create scene interface
     */
    protected createGameScene(): void {
        this.img_1 = new egret.Bitmap();
        let text: egret.Texture = RES.getRes("14_2_png");
        this.img_1.texture = text;
        this.img_1.x = 300;
        this.img_1.y = 200;
        this.img_1.anchorOffsetX = this.img_1.width / 2;
        this.img_1.anchorOffsetY = this.img_1.height / 2;
        this.img_1.rotation = 0;
        this.addChild(this.img_1);
        let img1Bounds = this.img_1.getBounds(null,true);
        let bgBox = this.drawImg(this.img_1);
        let len = this.img_1.parent.numChildren;
        this.addChildAt(bgBox,len - 1);
        egret.log("img1Bounds is ",img1Bounds);
        this.img_2 = new egret.Bitmap();
        let text2: egret.Texture = RES.getRes("14_3_png");
        this.img_2.texture = text2;
        this.img_2.x = 200;
        this.img_2.y = 500;
        this.addChild(this.img_2);
        let img2Bounds = this.img_2.getBounds();
        egret.log("img1Bounds is ",img2Bounds);
        let time = 0;
        
    }
    private drawImg(obj: egret.DisplayObject): egret.Shape{
        this.drawPen.graphics.clear();
        this.drawPen.graphics.lineStyle(1,0xec0023,1.0);
        // 获取矩形区域的四个顶点坐标位置
        let points = CollisionUitls.getRectangleVerPoints(obj);
        this.drawPen.graphics.moveTo(points[0].x,points[0].y);
        for(let i: number = 1; i < points.length; i++) {
            this.drawPen.graphics.lineTo(points[i].x,points[i].y);
        }
        this.drawPen.graphics.lineTo(points[0].x,points[0].y);
        this.drawPen.graphics.endFill();
        return this.drawPen;
    }
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name: string): egret.Bitmap {
        let result = new egret.Bitmap();
        let texture: egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }
}
