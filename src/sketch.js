
var cameraX = 0, cameraY = 0, cameraZ = 0

const BOX1 = 101
const BOX2 = 102
const CLICKBOX = 128

var refresh = true
var rotX = 0
var rotY = 0


function setup() {
	mCreateCanvas(500, 500, WEBGL)
}

function draw() {
	if (mouseIsPressed) {
		mBackground(200);
		mResetMatrix(); // Always include mResetMatrix to ensure proper operation of the object picker.
		
		mCamera(cameraX, cameraY, cameraZ);

		var w = width
		var h = height
		var x = mouseX
		var y = mouseY
		var isOver = x>=0 && x<=w && y>=0 && y<=h
		if (isOver) {
			rotX += deg2Rad(mouseY - pmouseY)
			rotY += deg2Rad(mouseX - pmouseX)
		}

		// rotateX(rotX)
		// rotateY(rotY)


		mRotateX(rotX)
		mRotateY(rotY)

		// mPush()
		// 	fill("white")
		// 	mBox(BOX2, 400)
		// mPop()

		mPush();
			mBox(1, 100);
			mTranslate(200, 0, 0)
			mBox(2, 100);
		mPop();

		
		
		// If the mouse if clicked, check if it is clicked on specific objects
		// and change the objects or spawn new objects

		// if (mouseIsPressed) {
			// var om = objectAtMouse()
			console.log(objectAtMouse());
			// switch (om) {
			// 	case BOX1:  // Spawn a set of boxes when clicked
			// 		for(var i=0; i<10; i++) {
			// 			mPush();
			// 			mTranslate(0,0,(i-5)*50);
			// 			// mRotateZ(frameCount * 0.01);
			// 			mBox(CLICKBOX, 30);
			// 			mPop();
			// 		}
			// 		break;
			// }
		// }

	}
}
