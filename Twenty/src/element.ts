class element extends egret.Sprite{
    public num: number;             //数字
    public index: number;           //位置
    public box: egret.TextField;       //方块
    private color: Array<number> = [];   //颜色

    public constructor(_num: number,_index: number){
        super();
        this.createColorList();
        this.num = _num;
        this.index = _index;

        this.box = new egret.TextField;
        this.box.text = _num + 1 + '';
        this.box.background = true;
        this.box.backgroundColor = this.color[_num];
        this.box.border = true;
        this.box.borderColor = 0xc2cbc2;
        this.box.size = 60;
        this.box.stroke = 4;
        this.box.strokeColor = 0xff0000;
        this.box.textAlign = egret.HorizontalAlign.CENTER;
        this.box.verticalAlign = egret.VerticalAlign.MIDDLE;
        this.box.width = 80;
        this.box.height = 80;
        this.box.anchorOffsetX = 50;
        this.box.anchorOffsetY = 50;
        this.box.touchEnabled = false;

        var point = new egret.Point();
        point = Util.getPointXYByIndex(_index);
        this.x = point.x;
        this.y = point.y + 90;

        this.addChild(this.box);
    //    this.addEventListener(GameEvent.BOXDROP,this.drop,this);
    }

    public createColorList(){
        for(var i:number = 0 ; i < 56; i++){
            this.color.push(0xff0000);
        }
    }

    public moveto(_index: number,hide: boolean){
        var point = Util.getPointXYByIndex(_index);
        if(hide){
            egret.Tween.get(this).to({x: point.x, y: point.y}, 300, egret.Ease.sineIn).call(this.hide,this);
        }else{
            egret.Tween.get(this).to({x: point.x, y: point.y}, 300, egret.Ease.sineIn);
        }
    }
    //方块合成，数字加1,触发掉落事件
    public eliminate(box: element, hide: boolean){
        box.num += 1;
        if(box.num > DataManage.instance().maxNum){
            DataManage.instance().maxNum = box.num;
        }
        box.box.text = box.num + 1 + '';
        if(hide){
            this.hide();
        }
        console.log('合成后box.index=' + box.index + ',num=' + box.num + ',隐藏的index=' + this.index);
        box.drop();
    }
    //合成后从面板中移除
    private hide(){
        if(this.parent){
            this.parent.removeChild(this);
        }
    }

    //判断两个砖块的数字是否相等
    public isEquality(box: element): boolean{
        if(this.num === box.num){
            return true;
        }
        return false;
    }
    //判断两个砖块是否可以消除
    public isEliminate(box: element): boolean{
       if(this.index === box.index){
            return true;
       }
       return false;
    }

    //单个碰撞处理
    public simpleHitHandle(x: number,y: number,box: element): egret.Point{

        if(x < this.x && box.x < this.x && Math.abs(box.y - this.y) < 80){          //左移中碰到障碍
           // console.log('左移中碰到障碍');
            x = this.x ;
        }
        if(x > this.x && box.x > this.x && Math.abs(box.y - this.y) < 80){          //右移中碰到障碍
           // console.log('右移中碰到障碍');
            x = this.x ;
        }
        if(y < this.y && box.y < this.y && Math.abs(box.x - this.x) < 80){          //上移中碰到障碍
           // console.log('上移中碰到障碍');
            y = this.y ;
        }
        if(y > this.y && box.y > this.y && Math.abs(box.x - this.x) < 80){          //下移中碰到障碍
           // console.log('下移中碰到障碍');
            y = this.y ;
        }
        //console.log('---------------------------------------------');
        return new egret.Point(x,y);
    }

    //两个碰撞处理
    public doubleHitHandle(x: number,y: number,box1: element,box2: element): egret.Point{
        if(x < this.x){
            if(box1.x < this.x && Math.abs(box1.y - this.y) < 80 || box2.x < this.x && Math.abs(box2.y - this.y) < 80)
            {
               // console.log('左移中碰到障碍');
                x = this.x ;
            }
        }
        if(x > this.x){
            if(box1.x > this.x && Math.abs(box1.y - this.y) < 80 || box2.x > this.x && Math.abs(box2.y - this.y) < 80){          //右移中碰到障碍
                //console.log('右移中碰到障碍');
                x = this.x ;
            }
        }
        if(y < this.y){
            if(box1.y < this.y && Math.abs(box1.x - this.x) < 80 || box2.y < this.y && Math.abs(box2.x - this.x) < 80){          //上移中碰到障碍
                //console.log('上移中碰到障碍');
                y = this.y ;
            }
        }
        if(y > this.y){
            if(box1.y > this.y && Math.abs(box1.x - this.x) < 80 || box2.y > this.y && Math.abs(box2.x - this.x) < 80){          //下移中碰到障碍
                //console.log('下移中碰到障碍');
                y = this.y ;
            }
        }
   //     console.log('---------------------------------------------');
        return new egret.Point(x,y);
    }

    //获取砖块自己上方的所有方块
    public getUpAllBox(): Array<element>{
        var upBoxList: Array<element> = [];
        var point: egret.Point = Util.getPointByIndex(this.index);
        for(var y:number = point.y - 1; y > 0; y--){
            var index: number = Util.getIndexByPoint(new egret.Point(point.x,y));
            var box: element = Util.getElementByIndex(index)
            if(box){
                upBoxList.push(box);
                //console.log('上方砖块索引=' + box.index);
            }
        }
        return upBoxList;
    }

    //下方无砖块时下落
    public drop(){
       // console.log('砖块下落');
        var _index: number = this.index;
        DataManage.instance().map[this.index] = false;
        var point: egret.Point = Util.getPointByIndex(_index);
        for(var i:number = 1; i < 8 - point.y ; i++)
        {
            this.index = _index - 7 * i;
        //    console.log('下方是否有障碍' + DataManage.instance().map[this.index]);
            if(DataManage.instance().map[this.index]){
                var box: element = Util.getElementByIndex(this.index);
         //       console.log('this.num=' + this.num + ',box.num=' + box.num);
          //      console.log('碰撞对象数字是否相等=' + this.isEquality(box));
                if(this.isEquality(box)){
                    this.moveto(this.index,true);
                    this.eliminate(box,false);
                    DataManage.instance().delete(this);
                }else{
                    this.index += 7;
                    this.moveto(this.index,false);
                    DataManage.instance().map[this.index] = true;
                }
                return;
            }
        }
        this.moveto(this.index,false);
        DataManage.instance().map[this.index] = true;
    }
} 