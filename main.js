phina.globalize();

var W = 640; 
var H = 480;

//ゲームシーン
phina.define("MainScene", {
    superClass: "CanvasScene",
    init: function () {
        let self = this;

        this.superInit();
        //プレイヤー
        this.player = Label().addChildTo(this);
        this.player.fill = "black";
        this.player.text = "聖";
        this.player.attackCount = 0;
        this.player.height = 15;
        this.player.width = 15;
        this.player.hp = 5;
        this.player.update = function (app) {
            var p = app.pointer;
            if (this.attackCount === 0) {
                var vec = new Vector2(p.x - this.x, p.y - this.y);

                //移動するか
                var isMove = vec.lengthSquared() > 10 * 10;

                //正規化
                vec.normalize();

                //マウスと10以上離れているなら移動
                if (isMove) {
                    this.x += vec.x * 5;
                    this.y += vec.y * 5;
                }

                //攻撃開始
                if (p.getPointingStart()) {
                    this.attackCount = 30;
                    this.fill = "blue";
                }
            }

            if (this.attackCount !== 0) {
                this.attackCount--;
                if (this.attackCount === 0) {
                    this.fill = "black";
                }
            }
        }

        //あうあう
        this.auau = CanvasElement().addChildTo(this);

        //ビーム
        this.beam = CanvasElement().addChildTo(this);

        //プギャー
        this.pugya = CanvasElement().addChildTo(this);

        //score
        this.score = 0;

        //得点ラベル
        this.scoreL = Label().addChildTo(this);
        this.scoreL.fill = "black";
        this.scoreL.origin.set(0, 0);
        this.scoreL.x = 10;
        this.scoreL.y = 10;
        this.scoreL.update = function (app) {
            this.text = self.score+"kill";
        };

        //HPラベル
        this.hpL = Label().addChildTo(this);
        this.hpL.fill = "black";
        this.hpL.origin.set(0, 0);
        this.hpL.x = 10;
        this.hpL.y = 35;
        this.hpL.update = function (app) {
            this.text = "HP:"+self.player.hp;
        };
    },

    update: function (app) {
        var self = this;

        //あうあう出現
        if (Math.randint(0, 60) === 0) {
            var auau = Label().addChildTo(this.auau);
            auau.x = Math.randint(0, 1) === 0 ? 0 : W;
            auau.y = Math.randint(0, 1) === 0 ? 0 : H;
            auau.fill = "black";
            auau.text = "(^p^)";
            //ビーム関係
            auau.beam = null;
            auau.vec = null;
            auau.update = function (app) {
                //ビーム開始
                if (Math.randint(0, 600) === 0 && this.beam === null) {
                    this.beam = {};
                    this.beam.count = 0;
                    this.beam.enum = Math.randint(0, 1) === 0 ? 1 : 2;
                    let vec = new Vector2(self.player.x - this.x, self.player.y - this.y);
                    vec.normalize();
                    vec.mul(1);
                    this.beam.vec = vec;
                    this.fill = "blue";
                }

                //ビーム
                if (this.beam !== null) {
                    if (this.beam.count % 30 === 0&&this.beam.count>=60) {
                        let char = null;//発射文字
                        if (this.beam.enum === 1) {//あうあう
                            char = ["あ", "う", "あ", "う", "あ", "ー"][(this.beam.count-60) / 30];
                        } else {//ぺ
                            char = ["ぱ", "し", "へ", "ろ", "ん", "だ", "す"][(this.beam.count-60) / 30];
                        }
                        if (char === undefined) {//終わり
                            this.beam = null;
                            this.fill = "black";
                        } else {
                            let b = Label().addChildTo(self.beam);
                            b.x = this.x;
                            b.y = this.y;
                            b.fill = "black";
                            b.text = char;
                            b.vec = this.beam.vec;
                            b.height = 15;
                            b.width = 15;
                            b.update = function (app) {
                                this.x += this.vec.x;
                                this.y += this.vec.y;
                                if (isOut(this)) {
                                    this.remove();
                                }
                            }
                        }
                    }
                    if(this.beam!==null)this.beam.count++;
                } else {//ビームでなければ移動
                    if (Math.randint(0, 60) === 0 || this.vec === null) {
                        this.vec = new Vector2();
                        this.vec.fromAngle(Math.randfloat(0, Math.PI * 2), Math.randfloat(0.3, 1));
                    }
                    this.x += this.vec.x;
                    this.y += this.vec.y;

                    if (this.x < 0) this.x = 0;
                    if (this.x > W) this.x = W;
                    if (this.y < 0) this.y = 0;
                    if (this.y > H) this.y = H;
                }
            }
        }

        //当たり判定
        for(let b of this.beam.children) {
            if (b.hitTestElement(this.player)) {
                b.remove();
                this.player.hp--;
                if (this.player.hp === 0) {
                    this.exit("result", { score: this.score });
                }
            }
        }

        for(let a of this.auau.children) {
            if (this.player.attackCount!==0&&a.hitTestElement(this.player)) {
                //プギャー
                let p = Label().addChildTo(this.pugya);
                p.text = "ぷぎゃー";
                p.fill = "red";
                p.x = a.x;
                p.y = a.y;
                p.count = 0;
                p.update = function () {
                    this.count++;
                    if (this.count === 60) {
                        this.remove();
                    }
                }

                a.remove();
                this.score++;
            }
        }
    }
});



// メイン処理
phina.main(function () {
    var app = GameApp({
        width: W,
        height: H,
        fps: 60,
        title: "AUAU\nマウスで移動、左クリックで攻撃"
    });
    app.run();
});

var isOut = function (o) {
    return o.right < 0 || o.left > W || o.bottom < 0 || o.top > H;
}
