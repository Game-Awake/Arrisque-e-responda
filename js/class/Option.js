class Option extends Phaser.GameObjects.Container {

    constructor(x,y,w,h,color,line,border,text,style,callback,scene) {
        let rectangle = scene.add.rectangle(0,0,w,h,color);
        rectangle.setStrokeStyle(line,border);
        rectangle.setInteractive();
        rectangle.on("pointerdown",callback); 
        let box = scene.add.text(0,0,text,style);
        box.setOrigin(0.5);
        super(scene,x,y,[rectangle,box]);
        scene.add.existing(this);
    }

}