

var app = angular.module("App", [])

app.controller("AppCtrl", function ($scope) {

	$scope.layer  = 0
	$scope.size   = 16
	$scope.matrix = []
	$scope.ep_plaque = 5

	$scope.tool  = "add" // "chnage" , "remove"
	$scope.color = "#2874a6"
	$scope.outline = true
	$scope.name = "voxel"
	$scope.axis = "Z"
	axisChanged = false
	$scope.oinionDir = true

	$scope.blackWhite = false
	$scope.contraste = 120
	$scope.useGravure = true

	$scope.socleParam = {size: 8, use: false }
	// socleDiametre  = () => 50 * $scope.socleParam.size;
	socleDiametre  = () => ($scope.ep_plaque*10) * $scope.socleParam.size;
	
	var downlad_svg_trigger = false
	var refreshP5 = true

	
	$scope.seeConsole = function() {
		console.log($scope.matrix, $scope.axis)
	}

	$scope.changeAxis = function(axis) {
		// var m = math.matrix($scope.matrix)
		// var m_ = math.matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])
		// if ($scope.axis === "Z" && axis === "X") {
		// 	m_ = math.matrix([[1, 0, 1], [0, 1, 0], [-1, 0, 1]])
		// }

		// var res = math.multiply(m_, m)

		// console.log(res)

		$scope.axis = axis
		axisChanged = true
	}

	;(generateMatrix = function() {
		for (var i=0 ; i<$scope.size ; i++) {
			$scope.matrix[i] = []
			for (var j=0 ; j<$scope.size ; j++) {
				$scope.matrix[i][j] = []
				for (var k=0 ; k<$scope.size ; k++) {
					$scope.matrix[i][j][k] = undefined
				}
			}
		}
	})()

	$scope.changeLayer = function(val) {
		$scope.layer += val
		if ($scope.layer >= $scope.size) $scope.layer = $scope.size - 1
		if ($scope.layer < 0) $scope.layer = 0
	}

	$scope.copyUp = function() {

	}

	$scope.save = function() {
		// data = JSON.stringify({name: $scope.name, matrix: $scope.matrix})
		// nom = $scope.name + ".vox"
		// download(data, nom, "text/plain")

		var save = []
		for (var i=1 ; i<objects.length ; i++) {
			var pos = objects[i].position
			var col = objects[i].material.color
			save.push({position: pos, color: col})
		}

		var save2 = []
		for (var i=0 ; i<attachs.length ; i++) {
			var pos = attachs[i].position
			save2.push({position: pos})
		}
		console.log(attachs, save2)

		data = JSON.stringify({name: $scope.name, matrix: save, attachs: save2})
		nom = $scope.name + ".vox"
		download(data, nom, "text/plain")
	}

	$scope.load = function(data) {
		var dataP = JSON.parse(data)
		$scope.name = dataP.name
		// $scope.matrix = dataP.matrix

		for (var i=objects.length-1 ; i>0 ; i--) {
			var ob = (objects.splice(i, 1))[0]
			scene.remove( ob )
		}

		for (var i=0 ; i<attachs.length ; i++) {
			scene.remove( attachs[i] )
		}
		attachs = []

		dataP.matrix.forEach(d => {
			var material = new THREE.MeshLambertMaterial( { color: d.color } )
			const voxel = new THREE.Mesh( cubeGeo, material )
			voxel.position.x = d.position.x
			voxel.position.y = d.position.y
			voxel.position.z = d.position.z

			objects.push(voxel)
			scene.add( voxel )

			addSelectedObject(voxel)
			outlinePass.selectedObjects = selectedObjects
		})

		dataP.attachs.forEach(d => {
			var material = new THREE.MeshLambertMaterial( { color: 0x7dcea0  } )
			const voxel = new THREE.Mesh( cubeGeo, material )
			voxel.position.x = d.position.x
			voxel.position.y = d.position.y
			voxel.position.z = d.position.z

			attachs.push(voxel)
			if ($scope.socleParam.use) scene.add( voxel )
		})

		render()
	}

	update = false
	$scope.outliner = function() {
		$scope.outline = !$scope.outline
		update = true

		if ($scope.outline) outlinePass.edgeStrength = 10
		else outlinePass.edgeStrength = 0

		updateOutlineObjects()
		render()
	}

	$scope.changeBlackWhiteMode = function() {
		$scope.blackWhite = !$scope.blackWhite

		var factor = (259 * ($scope.contrast + 255)) / (255 * (259 - $scope.contrast))

		if ($scope.blackWhite) {
			objects.forEach(o => {
				var hsl = { h: 0, s: 0, l: 0 }
				c = o.material.color
				hsl = c.getHSL(hsl)
				l = map(hsl.l, 0, 1, 0, 255)
				val  = factor*(l-128) + 128
				val_ = map(val, 0, 255, 0, 1) 
				val_ = constrain(val_, 0, 1)
				c.setHSL(hsl.h, 0, val_)
			})
		} else {
			objects.forEach(o => {
				var hsl = { h: 0, s: 0, l: 0 }
				c = o.material.color
				c.set(o.color_)
			})
		}
		
	}

	$scope.updateContrast = function() {
		if (!$scope.blackWhite) return

		var factor = (259 * ($scope.contrast + 255)) / (255 * (259 - $scope.contrast))

		objects.forEach(o => {
			var hsl = { h: 0, s: 0, l: 0 }
			c = o.material.color
			c.set(o.color_)
			hsl = c.getHSL(hsl)
			l = map(hsl.l, 0, 1, 0, 255)
			val  = factor*(l-128) + 128
			val_ = map(val, 0, 255, 0, 1) 
			val_ = constrain(val_, 0, 1)
			c.setHSL(hsl.h, 0, val_)
		})
	}


	// src : https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
	function download(data, filename, type) {
		var file = new Blob([data], {type: type});
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others
			var a = document.createElement("a"),
					url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);  
			}, 0); 
		}
	}


	$scope.download_svg = function() {
		// modalClose('modal-canvas');
		downlad_svg_trigger = true
	}


	var layers = []
	var attachsLayer = []
	$scope.layersExport = function() {
		layers = []
		attachsLayer = []
		// for (var i=1 ; i<objects.length ; i++) {
		// 	console.log(objects[i])
		// }

		// console.log(objects[10].material.color)
		
		for (i=-375 ; i<= 375 ; i+=50) {
			res = []
			objects.forEach(obj => {
				if (obj.position.z === i) {
					var pos = {x : 0, y: 0}
					pos.x = (obj.position.x+25) / 50 - 1 + 8
					pos.y = (obj.position.y+25) / 50
					// res.push({pos: pos, color: obj.color_, attach: false})
					var hsv = rgb2hsv2(obj.material.color)
					res.push({pos: pos, color: hsv, attach: false})

				}
			})

			if ($scope.socleParam.use) {
				attachs.forEach(att => {
					if (att.position.z === i) {
						var pos = {x : 0, y: -1*0}
							pos.x = (att.position.x+25) / 50 - 1 + 8
							res.push({pos: pos, color: "#ffffff", attach: true})
					}
				})
			}

			layers.push(res)
		}

		// $scope.socleParam.use

		attachs.forEach(att => {
			var pos = {x : 0, z: 0}
				pos.x = (att.position.x+25) / 50 - 1 + 8
				pos.z = (att.position.z+25) / 50

				// console.log(pos.z, att.position.z)

			attachsLayer.push(pos)
		})

		// console.log(layers)

		refreshP5 = true


		modalManagement('modal-canvas')
	}



	// src : https://stackoverflow.com/questions/8022885/rgb-to-hsv-color-in-javascript
	function color2hsv(color) {
		var r = parseInt("0x" + color.substring(1, 3))
		var g = parseInt("0x" + color.substring(3, 5))
		var b = parseInt("0x" + color.substring(5, 7))

		return rgb2hsv(r, g, b)
	}

	function rgb2hsv (r, g, b) {
		let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
		rabs = r / 255;
		gabs = g / 255;
		babs = b / 255;
		v = Math.max(rabs, gabs, babs),
		diff = v - Math.min(rabs, gabs, babs);
		diffc = c => (v - c) / 6 / diff + 1 / 2;
		percentRoundFn = num => Math.round(num * 100) / 100;
		if (diff == 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rr = diffc(rabs);
			gg = diffc(gabs);
			bb = diffc(babs);
	
			if (rabs === v) {
				h = bb - gg;
			} else if (gabs === v) {
				h = (1 / 3) + rr - bb;
			} else if (babs === v) {
				h = (2 / 3) + gg - rr;
			}
			if (h < 0) {
				h += 1;
			}else if (h > 1) {
				h -= 1;
			}
		}
		return {
			h: Math.round(h * 360),
			s: percentRoundFn(s * 100),
			v: percentRoundFn(v * 100)
		};
	}

	function rgb2hsv2 (obj) {
		let rabs, gabs, babs, rr, gg, bb, h, s, v, diff, diffc, percentRoundFn;
		rabs = obj.r;
		gabs = obj.g;
		babs = obj.b;
		v = Math.max(rabs, gabs, babs),
		diff = v - Math.min(rabs, gabs, babs);
		diffc = c => (v - c) / 6 / diff + 1 / 2;
		percentRoundFn = num => Math.round(num * 100) / 100;
		if (diff == 0) {
			h = s = 0;
		} else {
			s = diff / v;
			rr = diffc(rabs);
			gg = diffc(gabs);
			bb = diffc(babs);
	
			if (rabs === v) {
				h = bb - gg;
			} else if (gabs === v) {
				h = (1 / 3) + rr - bb;
			} else if (babs === v) {
				h = (2 / 3) + gg - rr;
			}
			if (h < 0) {
				h += 1;
			}else if (h > 1) {
				h -= 1;
			}
		}
		return {
			h: Math.round(h * 360),
			s: percentRoundFn(s * 100),
			v: percentRoundFn(v * 100)
		};
	}



	$scope.createSocle = function() {
		if ($scope.socleParam.use) socle.visible = true
		else socle.visible = false

		if (socle.visible) {
			attachs.forEach(elt => {
				scene.add(elt)
			})
		} else {console.log("super prout")
			attachs.forEach(elt => {
				scene.remove(elt)
			})
		}
	}

	$scope.updateSocle = function() {
		scene.remove( socle )
		const socleGeo = new THREE.CylinderGeometry( socleDiametre(), socleDiametre(), 50, 32 );
		socle = new THREE.Mesh( socleGeo, cubeMaterial );
		scene.add(socle);
		socle.position.set(0, -25, 0);
	}


	
	$scope.setAttach = false
	$scope.addAttach = function() {
		$scope.setAttach = !$scope.setAttach
	}

	$scope.showSocle = function() {
		socleMaterial.visible = !socleMaterial.visible
	}

	$scope.resetAttach = function() {
		attachs.forEach(elt => {
			scene.remove(elt)
		})
		attachs = []
	}



let camera, scene, renderer, controls, outlinePass, composer, effectFXAA;
let plane, socle;
let pointer, raycaster, isShiftDown = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial, outlineMaterial;

let depthTexture, renderTarget;


var objects  = [];
var objectsO = [];
var attachs  = [];

var selectedObjects = []

init();
render();

function init() {

	camera = new THREE.PerspectiveCamera( 45, 1, 1, 10000 );
	camera.position.set( 500, 800, 1300 );
	camera.lookAt( 0, 0, 0 );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xffffff );
	// scene.background = new THREE.Color( 0xa0a0a0 );

	// roll-over helpers

	const rollOverGeo = new THREE.BoxGeometry( 50, 50, 50 );
	rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
	rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
	scene.add( rollOverMesh );

	// cubes

	cubeGeo = new THREE.BoxGeometry( 50, 50, 50 );
	cubeMaterial    = new THREE.MeshLambertMaterial( { color: 0xfeb74c } );
	outlineMaterial = new THREE.MeshLambertMaterial( { color: 0x222222, wireframe: true } );
	socleMaterial   = new THREE.MeshLambertMaterial( { color: 0xfeb74c, wireframe: false } );

	// grid

	const gridHelper = new THREE.GridHelper( 16*50, 16 );
	scene.add( gridHelper );

	//

	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();

	// const geometry = new THREE.PlaneGeometry( 1000, 1000 );
	const geometry = new THREE.PlaneGeometry( 16*50, 16*50 );
	geometry.rotateX( - Math.PI / 2 );
	plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
	scene.add( plane );
	objects.push( plane );

	const socleGeo = new THREE.CylinderGeometry( socleDiametre(), socleDiametre(), 50, 32 );
	socle = new THREE.Mesh( socleGeo, socleMaterial );
	scene.add(socle);
	socle.position.set(0, -25, 0);
	socle.visible = false

	// lights

	// const ambientLight = new THREE.AmbientLight( 0x606060 );
	const ambientLight = new THREE.AmbientLight( 0xA0A0A0 );
	// const ambientLight = new THREE.AmbientLight( 0xffffff );
	scene.add( ambientLight );

	const directionalLight = new THREE.DirectionalLight( 0xffffff );
	directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
	scene.add( directionalLight );

	const directionalLight2 = new THREE.DirectionalLight( 0xffffff );
	directionalLight2.position.set( -1, 0.75, -0.5 ).normalize();
	scene.add( directionalLight2 );


	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	// renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setSize( 500, 500 );
	
	// container = document.getElementById( "3D" );
	// container.appendChild( renderer.domElement );
	// document.body.appendChild( container );
	document.body.appendChild( renderer.domElement )

	document.addEventListener( 'pointermove', onPointerMove );
	document.addEventListener( 'pointerdown', onPointerDown );
	document.addEventListener( 'keydown', onDocumentKeyDown );
	document.addEventListener( 'keyup', onDocumentKeyUp );

	//

	window.addEventListener( 'resize', onWindowResize );


	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.mouseButtons.LEFT = undefined
	controls.mouseButtons.MIDDLE = 0
	controls.mouseButtons.RIGHT = undefined


	composer = new THREE.EffectComposer(renderer);
	var renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);


	outlinePass = new THREE.OutlinePass(new THREE.Vector2(500, 500), scene, camera);
	outlinePass.edgeStrength = 10
	outlinePass.visibleEdgeColor.set( "#f0f0f0" );
	// outlinePass.hiddenEdgeColor.set( "#ff0000" );

	// composer.addPass(outlinePass);
}

function onWindowResize() {
	camera.aspect = 1;
	camera.updateProjectionMatrix();
	renderer.setSize( 500, 500 );

	render();
}

function addSelectedObject( object ) {
	selectedObjects.push( object );
}

function onPointerMove( event ) {
	pointer.set( ( event.clientX / 500 ) * 2 - 1, - ( event.clientY / 500 ) * 2 + 1 );

	raycaster.setFromCamera( pointer, camera );

	const intersects = raycaster.intersectObjects( objects, false );


	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ];

		rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
		rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
	}

	render();
}

function onPointerDown( event ) {
	pointer.set( ( event.clientX / 500 ) * 2 - 1, - ( event.clientY / 500 ) * 2 + 1 );

	raycaster.setFromCamera( pointer, camera );

	var intersects = raycaster.intersectObjects( objects, false );


	if ( intersects.length > 0 ) {

		const intersect = intersects[ 0 ];

		// delete cube
		if ( event.button === 2 ) {
			if ( intersect.object !== plane && intersect.object !== socle ) {
				scene.remove( intersect.object );
				objects.splice( objects.indexOf( intersect.object ), 1 );
			}

		// create cube
		} else if (event.button === 0) {
			var material = new THREE.MeshLambertMaterial( { color: new THREE.Color($scope.color.trim()) } );
			if ($scope.setAttach) material = new THREE.MeshLambertMaterial( { color: 0x7dcea0  } );

			const voxel = new THREE.Mesh( cubeGeo, material ); //scope.color
			voxel.position.copy( intersect.point ).add( intersect.face.normal );
			voxel.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
			voxel.color_ = $scope.color.trim()

			var vp = voxel.position
			// console.log(vp, vp.x >= -375 , vp.y <= 375 , vp.z >= -375 , vp.z <= 375 , vp.y >= 25 , vp.y <= 775)

			if (vp.x >= -375 && vp.x <= 375 && vp.z >= -375 && vp.z <= 375 && vp.y >= 25 && vp.y <= 775) {
				if (!$scope.setAttach) {
					objects.push( voxel );
					addSelectedObject(voxel)
					outlinePass.selectedObjects = selectedObjects;
					scene.add( voxel );
				} else {
					// if (intersect.object === plane) {
					// if (!objects.includes(intersect.object)) {
						attachs.push( voxel )
						// voxel.position.y -= 50
						voxel.position.y = -25
	
						console.log("prout")
						scene.add( voxel );
					// }
				}
			}

			
			
		}


		updateOutlineObjects()

		render();

	}

}

function updateOutlineObjects() {
	objectsO.forEach(o => {
		scene.remove(o)
	})

	if (!$scope.outline) return
	objectsO = []
	for (var i=1 ; i<objects.length ; i++) {
		var o = objects[i]
		// var materialO = new THREE.MeshLambertMaterial( { color: "#000000" , wireframe : true } );
		// const voxelO = o.clone()
		// voxelO.material = materialO
		// objectsO.push(voxelO)
		// scene.add( voxelO );

		var helper = new THREE.EdgesHelper( o, 0x000000 );
		helper.position.x = o.position.x
		helper.position.y = o.position.y
		helper.position.z = o.position.z
		objectsO.push(helper)
		scene.add( helper );	

		
	}
}




function onDocumentKeyDown( event ) {

	switch ( event.keyCode ) {

		case 16: isShiftDown = true; break;

	}

}

function onDocumentKeyUp( event ) {

	switch ( event.keyCode ) {

		case 16: isShiftDown = false; break;

	}

}


function render() {
	renderer.render( scene, camera );
	composer.render();
	controls.update();
}







window.onload = function() {
// function doNothing() {
	var canvas = document.getElementById("myCanvas")
	paper.setup(canvas)

	var tool = new paper.Tool()
	var Path = paper.Path
	var Project = paper.project
	var Point = paper.Point
	var Group = paper.Group


	refresh = true
	const c = 0.2645833333
	const strokeWeight = 0.1 // 0.1 pour laser

	paper.view.onFrame = (ev) => {

		if (refreshP5 || downlad_svg_trigger) {
			Project.clear()
			
			// var factor = (259 * ($scope.contrast + 255)) / (255 * (259 - $scope.contrast))
			var factor = 1

			var geometries1 = []
			var geometries2 = []
			var group = new Group([])


			var L0 = $scope.ep_plaque * 16

			var index1 = 0
			var index2 = 0
			for (var i=0 ; i<layers.length ; i++) {
				var layer = layers[i]
				if (layer.length > 0) {
					geometries1.push(new paper.Rectangle(index2*(L0+5), index1*(L0+10), L0, L0))
				
					layer.forEach(elt => {
						x = index2*(L0+5) + elt.pos.x * $scope.ep_plaque
						y = index1*(L0+10) + L0-elt.pos.y * $scope.ep_plaque

						var val = 255
						if (elt.color) {
							var hsv = elt.color
							l    = map(hsv.v, 0, 100, 0, 255) 
							val  = factor*(l-128) + 128
							val = Math.floor(constrain(val, 0, 255))

							// console.log(hsv, val, l)
						}
						

						geometries2.push([new paper.Rectangle(x, y, $scope.ep_plaque, $scope.ep_plaque), val])
						
					})

					index1++
				}

				if (index1 >= 3) {
					index2++
					index1 = 0
				}

			}


			geometries1.forEach(geometry => {
				var path = Path.Rectangle(geometry)
				// path.strokeColor = "green"
				path.strokeColor = "#00ff00"
				path.strokeWidth = strokeWeight

				p = path.position
				path.position = new Point(p._x+5, p._y+5)

				group.addChild(path)
			})

			var red = undefined
			geometries2.forEach(geometry => {
				var path = Path.Rectangle(geometry[0])
				path.strokeColor = "red"
				var col = geometry[1].toString(16)
				// path.fillColor = "#" + col + col + col
				path.strokeWidth = strokeWeight

				p = path.position
				path.position = new Point(p._x+5, p._y+5)

				// group.addChild(path)
				if (!red) red = path
				else red = red.unite(path, {insert: true, trace: false})
				path.visible = false
			})

			var int = []
			if ($scope.useGravure) {
				geometries2.forEach(geometry => {
					var path = Path.Rectangle(geometry[0])
					path.strokeWidth = 0
					var col = geometry[1].toString(16)
					path.fillColor = "#" + col + col + col
					// path.
					p = path.position
					path.position = new Point(p._x+5, p._y+5)
					// path.visible = false
					int.push(path)
				})
			}

			if (red) {
				red.visible = true
				red.fillColor = null
				group.addChild(red)
				int.forEach(elt => group.addChild(elt) )
			} 

			// console.log(attachs)

			if ($scope.socleParam.use) {
				var d = socleDiametre() / 10
				var i = (index1 >= 2) ? index2+1 : index2
				// console.log(d)
				// var path = new Path.Circle(new Point((d+$scope.ep_plaque*8)+5+(i)*(L0+5), 300-d-30), d);
				var path = new Path.Circle(new Point((d+$scope.ep_plaque*8)+5+(i)*(L0+5), $scope.ep_plaque*60-d-30), d);
				path.strokeColor = "red"
				path.strokeWidth = strokeWeight

				group.addChild(path)

				// attaches
				var red_ = undefined
				attachsLayer.forEach(elt => {
					var x = elt.x * $scope.ep_plaque
					var y = elt.z * $scope.ep_plaque
					var geo = new paper.Rectangle(x, y, $scope.ep_plaque, $scope.ep_plaque)
					var pathA = Path.Rectangle(geo)

					p = pathA.position
						// pathA.position = new Point(p._x+(d)+5+(i)*(L0+5), p._y+300-d-30-5)
						pathA.position = new Point(p._x+(d)+5+(i)*(L0+5), p._y+$scope.ep_plaque*60-d-30-5)
					pathA.strokeColor = "red"
					pathA.strokeWidth = strokeWeight

					if (!red_) red_ = pathA
					else red_ = red_.unite(pathA, {insert: true, trace: false})
					pathA.visible = false
					// group.addChild(pathA)
				})

				if (red_) {
					red_.visible = true
					group.addChild(red_)
				}
				
				
			}


			// var path2 = new Path.Rectangle(0, 0, 600, 300)
			// path2.strokeColor = "cyan"
			// path2.strokeWidth = strokeWeight
			// group.addChild(path2)

			group.scale(1/2, new Point(0, 0))



			var layer = new paper.Layer(group)
			paper.project.layers[0].removeChildren()


			if (downlad_svg_trigger) {
				group.scale(1/c*2, new Point(0, 0))
				// if (red)  red.visible = false
				// if (red_) red_.visible = false
				options = {
					asString: true,
					bounds: new paper.Rectangle(0, 0, 600/c, 300/c)
				}

				var fileName = $scope.name + ".svg"
				var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG(options))
				var link = document.createElement("a")
				link.download = fileName
				link.href = url
				link.click()


				downlad_svg_trigger = false
			}
			
			
			refreshP5 = false
		}


	}


}



})



// src : https://www.geeksforgeeks.org/how-to-read-a-local-text-file-using-javascript/ + https://stackoverflow.com/questions/22570357/angularjs-access-controller-scope-from-outside
document.getElementById("inputfile").addEventListener("change", function() {
		var fr = new FileReader()
		fr.onload=function() {
			var elt = document.querySelector('[ng-app=App]');
			var scope = angular.element(elt).scope();
			scope.load(fr.result)
		}
		fr.readAsText(this.files[0])
})



window.addEventListener('contextmenu', function (e) { 
	// do something here... 
	e.preventDefault(); 
}, false);