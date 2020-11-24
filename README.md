# HTF2020 PlayGround template
## Clone & install
To clone the repository, use the following command
```javascript
git clone https://github.com/nicolasgoris/htf20_playground.git
```
To install the necessary packages, use the following command
```javascript
npm i
```
## Run and use
To run the server, use the following command
```javascript
npm start
```
## IoT & adapting code
### IoT
Don't forget to be able to play the game, you need to run your IoT server as well!
### Code
You will need to change the code, this will be done in two important files: [Main.view.xml](./webapp/view/Main.view.xml) and [Main.controller.js](./webapp/controller/Main.controller.js).  
In the last status of the game you will need to create a new file in the [View directory](./webapp/view/) to create a Dialog (pop-up).  
To know which events to implement, you can check the events that are being fired from the [PlayGround.js](./webapp/htf/PlayGround.js) file.  
An example of how you can implement an event:
[Main.view.xml](./webapp/view/Main.view.xml)
```xml
<htf:PlayGround id="playGround" showTechInfo="true"
  initiatePlayer="onInitiatePlayer"
></htf:PlayGround>
```
Note that the name of the XML attribute should correspond with the name of the event that will be fired from the PlayGround.
[PlayGround.js](./webapp/htf/PlayGround.js
```javascript
this.fireEvent("initiatePlayer", {});
```
In the controller you then use the value of the XML attribute to attach a function to it and run your JavaScript code.
[Main.controller.js](./webapp/controller/Main.controller.js)
```javascript
onInitiatePlayer: function (oEvent) {
  // Awesome code that will initiate your player
},
```
## Help
In case something is not working as it should or you think there is some coding wrong in the [PlayGround.js](./webapp/htf/PlayGround.js) file, contact Nicolas directly.  
For other questions or help in coding the app, you can contact one of the coaches.