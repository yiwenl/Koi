import oscP5.*;
import netP5.*;

OscP5 oscP5;
NetAddress myBroadcastLocation;

ArrayList<OscMessage> messageList = new ArrayList<OscMessage>();

//OscMessage statusMessage = new OscMessage("/status/");
 
  /*
  
  OSC signal : 
    positions -> x , y  ( -1 ~ 1 ) 
    velocity -> 0 ~ 1
    direction -> x, y
  
  */
float w2, h2;
float mx, my;
float prevX, prevY;
float vel, maxVel = 0.5;
PVector dir;

//  OSC Messages
OscMessage msgPosition;
OscMessage msgVelocity;
OscMessage msgDirection;

void setup() {
  size(512, 512, P3D);
  
  //  SETUP OSC
  oscP5 = new OscP5(this, 12000);
  myBroadcastLocation = new NetAddress("192.168.1.164", 32000);
  msgPosition = new OscMessage("/position");
  msgVelocity = new OscMessage("/velocity");
  msgDirection = new OscMessage("/direction");
  
  w2 = width/2.0;
  h2 = height/2.0;
}


void draw() {
   background(0);       
   
   prevX = mx;
   prevY = my;
   
   mx = (mouseX - w2)/w2;
   my = (mouseY - h2)/h2;
   
   float dx = mx - prevX;
   float dy = my - prevY;
   
   vel = sqrt( dx * dx + dy * dy) / maxVel;
   if(vel > 1.0) vel = 1.0;
   
   dir = new PVector(dx, dy);
   dir.normalize();
      
   sendOscMessage();
}


void sendOscMessage() {
  //  position
   msgPosition.clearArguments();
   msgPosition.add(mx);
   msgPosition.add(my);
   oscP5.send(msgPosition, myBroadcastLocation);
   
   msgVelocity.clearArguments();
   msgVelocity.add(vel);
   oscP5.send(msgVelocity, myBroadcastLocation);
   
   msgDirection.clearArguments();
   msgDirection.add(dir.x);
   msgDirection.add(dir.y);
   oscP5.send(msgDirection, myBroadcastLocation);
}