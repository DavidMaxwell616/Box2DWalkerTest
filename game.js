var game = new Phaser.Game(800, 500, Phaser.CANVAS, 'phaser-example', { create: create, update: update, render: render });

var takingRightStep = true;
var takingLeftStep =  false;
var ground;
var body;
var head;
var rightThigh;
var rightLeg;
var rightHip;
var rightFoot;
var upperRightArm;
var lowerRightArm;
var leftThigh;
var leftLeg;
var leftHip;
var leftFoot;
var upperLeftArm;
var lowerLeftArm;
var originX=150;
var originY=250;//265;
var hipLimits = [-40,40];
var kneeLimits = [0,20];
var ankleLimits = [-5,20];
var elbowLimits = [-40,0];
var shoulderLimits = [-50,50];
var CATEGORY_BODYPARTS = 0x0001;  // 0000000000000001 in binary
var CATEGORY_GROUND = 0x0002; // 0000000000000010 in binary
var MASK_BODYPARTS = CATEGORY_GROUND;
var MASK_GROUND = -1; 
var thighMaxAngle = 15;
var walkSpeed = 1;
var motorTorque = 40;
var movementState = {
  Still: 0,
  Walk: 1,
  Jump: 2,
  Run: 3,
  Somersault: 4,
  Cartwheel: 5,
  Leapfrog: 6,
  QWOP: 7
};
var movement;
var text = [];

function create() {
 
  game.stage.backgroundColor = '#124184';

    // Enable Box2D physics
    game.physics.startSystem(Phaser.Physics.BOX2D);
    
    game.physics.box2d.gravity.y = 500;
    game.physics.box2d.friction = 1;
    game.physics.box2d.restitution = 0.1;
    game.physics.box2d.debugDraw.joints = true;
    game.physics.box2d.setBoundsToWorld();
    
    //  Create a static rectangle body for the ground. This gives us something solid to attach our crank to
    ground = new Phaser.Physics.Box2D.Body(this.game, null, game.world.centerX, 490, 0);
    ground.setRectangle(800, 20, 0, 0, 0);
    ground.friction=1;

    createBodiesAndJoints();

    // Set up handlers for mouse events
    game.input.onDown.add(mouseDragStart, this);
    game.input.addMoveCallback(mouseDragMove, this);
    game.input.onUp.add(mouseDragEnd, this);
    const values = Object.values(movementState)
 
    for (let index = 0; index < values.length; index++) {
      var label = Object.keys(movementState)[index];
      text[index] = game.add.text(
        50, 
        index*20+20, 
        label, 
      { font: "15px Arial", fill: "#ffffff"});
  
      text[index].anchor.set(0.5);
      
      text[index].inputEnabled = true;
      text[index].events.onInputDown.add(down, this);
      text[index].events.onInputOver.add(over, this);
      text[index].events.onInputOut.add(out, this);
      text[index].events.onInputUp.add(up, this);
    }
    movement = Object.keys(movementState)[0];
  }

function over(item){
  item.fill = "#ffff44";
}
function out(item){
  item.fill = "#ffffff";
}
function down(item) {
  item.fill = "#ff0000";
  movement = item.text;
}

function up(item) {
  item.fill = "#ff0000";
  movement = item.text;
}

function mouseDragStart() { game.physics.box2d.mouseDragStart(game.input.mousePointer); }
function mouseDragMove() {  game.physics.box2d.mouseDragMove(game.input.mousePointer); }
function mouseDragEnd() {   game.physics.box2d.mouseDragEnd(); }

function createBodiesAndJoints(){
  //Revolute Joint Parameters:
 //bodyA, 
 //bodyB, 
 //ax, 
 //ay, 
 //bx, 
 //by, 
 //motorSpeed, 
 //motorTorque, 
 //motorEnabled, 
 //lowerLimit, 
 //upperLimit, 
 //limitEnabled

 rightThigh = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY+150, 2);
 rightThigh.setRectangle(15, 80, 0, 0, 0);

 rightLeg = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY+160, 2);
 rightLeg.setRectangle(15, 80, 0, 0, 0);
 rightKnee = game.physics.box2d.revoluteJoint(rightThigh, rightLeg, 0, 30, 0, -40,0,motorTorque,true,kneeLimits[0],kneeLimits[1],true);

 rightFoot = new Phaser.Physics.Box2D.Body(this.game, null, originX,originY+200, 2);
 rightFoot.setRectangle(50, 15, 0, 0, 0);
 rightAnkle = game.physics.box2d.revoluteJoint(rightLeg, rightFoot, 0, 40, -10, 0,0,motorTorque,true,ankleLimits[0], ankleLimits[1], true);

 upperRightArm = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY, 2);
 upperRightArm.setRectangle(15, 80, 0, 0, 0);

 lowerRightArm = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY, 2);
 lowerRightArm.setRectangle(15, 80, 0, 0, 0);
 rightElbow = game.physics.box2d.revoluteJoint(upperRightArm,lowerRightArm,  0, 40, 0, -30,0,motorTorque,false,elbowLimits[0],elbowLimits[1],true);

 body = new Phaser.Physics.Box2D.Body(this.game, null, originX,originY, 2);
 body.setRectangle(40, 120, 0, 0, 0);
 head = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY-50, 2);
 head.setCircle(25, 25, 0, 0, 0);
 var neck = game.physics.box2d.weldJoint(head, body, 20,50,0,-45);
 //body.static = true;

 rightHip = game.physics.box2d.revoluteJoint(body, rightThigh, 0, 40, 0, -50,0,motorTorque,true,hipLimits[0], hipLimits[1], true);
 rightShoulder = game.physics.box2d.revoluteJoint(upperRightArm, body, 0, -50, 0, -60,0,motorTorque,true,shoulderLimits[0],shoulderLimits[1],true);
 //prismatic joint between the piston and the ground, this joints purpose is just to restrict the piston from moving on the x axis
 //game.physics.box2d.prismaticJoint(ground, body, 0, 1, 0, 0, 0, 0);

 leftThigh = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY+150, 2);
 leftThigh.setRectangle(15, 80, 0, 0, 0);

 leftLeg = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY+160, 2);
 leftLeg.setRectangle(15, 80, 0, 0, 0);
 leftKnee = game.physics.box2d.revoluteJoint(leftThigh, leftLeg, 0, 30, 0, -40,0,motorTorque,true,kneeLimits[0],kneeLimits[1],true);
 leftHip = game.physics.box2d.revoluteJoint(body, leftThigh, 0, 40, 0, -50,0,motorTorque,true,hipLimits[0], hipLimits[1], true);

 leftFoot = new Phaser.Physics.Box2D.Body(this.game, null, originX,originY+200, 2);
 leftFoot.setRectangle(50, 15, 0, 0, 0);
 leftAnkle = game.physics.box2d.revoluteJoint(leftLeg, leftFoot, 0, 40, -10, 0,0,motorTorque,true,ankleLimits[0], ankleLimits[1], true);

 upperLeftArm = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY, 2);
 upperLeftArm.setRectangle(15, 80, 0, 0, 0);
 leftShoulder = game.physics.box2d.revoluteJoint(upperLeftArm, body, 0, -50, 0, -60,0,motorTorque,true,shoulderLimits[0],shoulderLimits[1],true);

 lowerLeftArm = new Phaser.Physics.Box2D.Body(this.game, null, originX, originY, 2);
 lowerLeftArm.setRectangle(15, 80, 0, 0, 0);
 leftElbow = game.physics.box2d.revoluteJoint(upperLeftArm,lowerLeftArm,  0, 40, 0, -30,0,motorTorque,false,elbowLimits[0],elbowLimits[1],true);

 //setup collision categories
 leftFoot.setCollisionCategory(CATEGORY_BODYPARTS);
 upperLeftArm.setCollisionCategory(CATEGORY_BODYPARTS);
 lowerLeftArm.setCollisionCategory(CATEGORY_BODYPARTS);
 leftLeg.setCollisionCategory(CATEGORY_BODYPARTS);
 leftThigh.setCollisionCategory(CATEGORY_BODYPARTS);

 rightFoot.setCollisionCategory(CATEGORY_BODYPARTS);
 upperRightArm.setCollisionCategory(CATEGORY_BODYPARTS);
 lowerRightArm.setCollisionCategory(CATEGORY_BODYPARTS);
 rightLeg.setCollisionCategory(CATEGORY_BODYPARTS);
 rightThigh.setCollisionCategory(CATEGORY_BODYPARTS);

 body.setCollisionCategory(CATEGORY_BODYPARTS);
 head.setCollisionCategory(CATEGORY_BODYPARTS);
 ground.setCollisionCategory(CATEGORY_GROUND);

 leftFoot.setCollisionMask(MASK_BODYPARTS);
 upperLeftArm.setCollisionMask(MASK_BODYPARTS);
 lowerLeftArm.setCollisionMask(MASK_BODYPARTS);
 leftLeg.setCollisionMask(MASK_BODYPARTS);
 leftThigh.setCollisionMask(MASK_BODYPARTS);

 rightFoot.setCollisionMask(MASK_BODYPARTS);
 upperRightArm.setCollisionMask(MASK_BODYPARTS);
 lowerRightArm.setCollisionMask(MASK_BODYPARTS);
 rightLeg.setCollisionMask(MASK_BODYPARTS);
 rightThigh.setCollisionMask(MASK_BODYPARTS);

 body.setCollisionMask(MASK_BODYPARTS);
 head.setCollisionMask(MASK_BODYPARTS);
 ground.setCollisionMask(MASK_GROUND);
}
function update(){
  
  if(body.x<0 || body.x>game.world.width)
  {
    switchSides();
  }

  switch (movement) {
  case 'Still':
 
    break;
  case 'Walk':
    console.log(takingRightStep);

     if(takingRightStep)
     {
       rightKnee.SetMotorSpeed(-walkSpeed);
       leftKnee.SetMotorSpeed(walkSpeed); 
       rightAnkle.SetMotorSpeed(walkSpeed);
       leftAnkle.SetMotorSpeed(-walkSpeed); 
       rightHip.SetMotorSpeed(walkSpeed);
       leftHip.SetMotorSpeed(-walkSpeed); 
        rightShoulder.SetMotorSpeed(-walkSpeed/2);
        leftShoulder.SetMotorSpeed(walkSpeed/2); 
       if(rightThigh.angle>hipLimits[0])
     {
       takingRightStep = false;
       takingLeftStep = true;
      }
      }
     else
    {
        rightKnee.SetMotorSpeed(-walkSpeed);
        leftKnee.SetMotorSpeed(walkSpeed); 
      rightAnkle.SetMotorSpeed(-walkSpeed);
      leftAnkle.SetMotorSpeed(walkSpeed); 
      leftHip.SetMotorSpeed(walkSpeed);
      rightHip.SetMotorSpeed(-walkSpeed); 
       rightShoulder.SetMotorSpeed(walkSpeed);
       leftShoulder.SetMotorSpeed(-walkSpeed); 
      if(leftThigh.angle>thighMaxAngle)
    {
      takingRightStep = true;
      takingLeftStep = false;
     }
  
    }
  
  default:
    break;
}

}

function switchSides(){
  // console.log(game.physics.box2d);
  // joints.forEach(element => {
  //   element.destroy();
  // });
 
  var bodies = game.physics.box2d.getBodies();
 bodies.forEach(element => {
 var joints = element.GetJointList();
 if(joints!=null&& joints.length>0){
 joints.forEach(joint => {
  joint.destroy(); 
 });
}
//game.world.removeBody(element);
 });
createBodiesAndJoints();
}






function render() {
    
  game.debug.box2dWorld();
}
