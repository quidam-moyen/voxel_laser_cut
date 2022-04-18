console.log("test")



var app = angular.module("App", [])

app.controller("AppCtrl", function ($scope) {

	$scope.layer  = 0
	$scope.size   = 16
	$scope.matrix = []

	$scope.tool  = "add" // "chnage" , "remove"
	$scope.color = "#2874a6"
	$scope.outline = true
	$scope.name = "voxel"
	$scope.axis = "Z"
	axisChanged = false
	$scope.oinionDir = true

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
		data = JSON.stringify({name: $scope.name, matrix: $scope.matrix})
		nom = $scope.name + ".vox"
		download(data, nom, "text/plain")
	}

	$scope.load = function(data) {
		var dataP = JSON.parse(data)
		$scope.name = dataP.name
		$scope.matrix = dataP.matrix
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


	new p5(p5Funct3D , document.getElementById("3D"))
	new p5(p5Funct2D , document.getElementById("2D"))

	function p5Funct3D(p) {
		var refresh = true
		var rotX = 0
		var rotY = 0

		p.setup = function() {
			p.createCanvas(500, 500, p.WEBGL)
			// p.ortho(-p.width/2, p.width/2, p.height/2, -p.height/2, 0, 500)
		}


		p.draw = function() {
			if (p.mouseIsPressed || p.mouseIsReleased || refresh) {
				p.background("white")

				var w = p.width
				var h = p.height
				var x = p.mouseX
				var y = p.mouseY

				var isOver = x>=0 && x<=w && y>=0 && y<=h

				if (isOver) {
					rotX -= deg2Rad(p.mouseY - p.pmouseY)
					rotY += deg2Rad(p.mouseX - p.pmouseX)
				}

				if (axisChanged) {
					axisChanged = false
					// p.rotateX(-rotX)
					// p.rotateY(-rotY)

					rotX = 0
					rotY = 0

					switch ($scope.axis) {
						case "X": rotY = deg2Rad(-90); break
						case "Y": rotX = deg2Rad(90); break
					}
				}

				p.rotateX(rotX)
				p.rotateY(rotY)
				


				var step = 15

				// p.translate(-$scope.size/2*step, -$scope.size/2*step, 0)


				p.push()
					p.translate(-$scope.size/2*step-step, -$scope.size/2*step-step, -$scope.size/2*step-step)
					p.stroke("red"); p.line(0, 0, 0, step, 0, 0)
					p.stroke("green"); p.line(0, 0, 0, 0, step, 0)
					p.stroke("blue"); p.line(0, 0, 0, 0, 0, step)
				p.pop()

				p.stroke("black")
				p.noFill()
				p.push()
					// p.translate($scope.size/2*step-step/2, $scope.size/2*step-step/2, $scope.size/2*step-step/2)
					p.box(step * $scope.size)
				p.pop()
				
				if (!$scope.outline) p.noStroke()

				for (var i=0 ; i<$scope.size ; i++) {
					for (var j=0 ; j<$scope.size ; j++) {
						for (var k=0 ; k<$scope.size ; k++) {
							val = $scope.matrix[k][j][i]
							if (val) {
								p.push()
									p.translate(-$scope.size/2*step+step/2, -$scope.size/2*step+step/2, -$scope.size/2*step+step/2)
									p.fill(val)
									p.translate(i*step, j*step, k*step)
									p.box(step)
								p.pop()
							}
						}
					}
				}

				p.push()
					var s = ($scope.size+2) * step
					var s2 = -$scope.size/2 * step + step * $scope.layer
					p.noStroke()
					p.fill("#0000AA0A")
					switch ($scope.axis) {
						case "Z": p.translate(0, 0, s2); break
						case "Y": p.translate(0, s2, 0); p.rotateX(deg2Rad(90)); break
						case "X": p.translate(s2, 0, 0); p.rotateY(deg2Rad(90)); break
					}
					
					p.plane(s, s)
				p.pop()

				refresh = false
				start = false
			}
		}
		
		p.mouseReleased = () => refresh = true
	}


	function p5Funct2D(p) {
		var refresh = true

		p.setup = function() {
			p.createCanvas(180, 180);

			p.strokeWeight = 1;
		}


		p.draw = function() {

			if (p.mouseIsPressed || p.mouseIsReleased || refresh) {
				p.background("white")


				var m = 10 * 0
				var w = p.width
				var h = p.height


				// display block
				p.noStroke()


				if ($scope.axis === "Z") {
					for (var i=0 ; i<$scope.size ; i++) {
						for (var j=0 ; j<$scope.size ; j++) {
							// onion
							if ($scope.oinionDir) {
								if ($scope.layer > 0) {
									val_ = $scope.matrix[$scope.layer-1][j][i]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(m+i*step, m+j*step, step, step)
									}
								}
							} else {
								if ($scope.layer < $scope.size-1) {
									val_ = $scope.matrix[$scope.layer+1][j][i]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(m+i*step, m+j*step, step, step)
									}
								}
							}

							val = $scope.matrix[$scope.layer][j][i]
							if (val) {
								p.fill(val)
								p.rect(m+i*step, m+j*step, step, step)
							}
						}
					}
				}

				if ($scope.axis === "X") {
					for (var i=0 ; i<$scope.size ; i++) {
						for (var j=0 ; j<$scope.size ; j++) {
							// onion
							if ($scope.oinionDir) {
								if ($scope.layer > 0) {
									var val_ = $scope.matrix[i][j][$scope.layer-1]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(($scope.size-1)*step-i*step-m, m+j*step, step, step)
									}
								}
							} else {
								if ($scope.layer < $scope.size-1) {
									var val_ = $scope.matrix[i][j][$scope.layer+1]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(($scope.size-1)*step-i*step-m, m+j*step, step, step)
									}
								}
							}

							val = $scope.matrix[i][j][$scope.layer]
							if (val) {
								p.fill(val)
								p.rect(($scope.size-1)*step-i*step-m, m+j*step, step, step)
							}
						}
					}
				}

				if ($scope.axis === "Y") {
					for (var i=0 ; i<$scope.size ; i++) {
						for (var j=0 ; j<$scope.size ; j++) {
							// onion
							if ($scope.oinionDir) {
								if ($scope.layer > 0) {
									var val_ = $scope.matrix[j][$scope.layer-1][i]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(m+i*step, ($scope.size-1)*step-m-j*step, step, step)
									}
								}
							} else {
								if ($scope.layer < $scope.size-1) {
									var val_ = $scope.matrix[j][$scope.layer+1][i]
									if (val_) {
										p.fill(val_.trim()+"aa")
										p.rect(m+i*step, ($scope.size-1)*step-m-j*step, step, step)
									}
								}
							}

							val = $scope.matrix[j][$scope.layer][i]
							if (val) {
								p.fill(val)
								p.rect(m+i*step, ($scope.size-1)*step-m-j*step, step, step)
							}
						}
					}
				}


				// display the grid
				p.stroke("black")
				p.noFill()

				step = (w-m*2) / $scope.size;
				for (var i=0 ; i<=$scope.size ; i++) {
					p.line(m+step*i, m, m+step*i, h-m)
					p.line(m, m+step*i, w-m, m+step*i)
				}

				var x = p.mouseX
				var y = p.mouseY


				if (x >= m && x <= w-m && y >= m && y <= h-m) {
					var x_ = (x - m) / step
					var y_ = (y - m) / step
					var x_ = Math.floor(x_)
					var y_ = Math.floor(y_)

					// console.log(x_, y_)

					var a = 0, b = 0, c = 0
					if ($scope.axis === "Z") { a = $scope.layer ; b = y_ ; c = x_ }
					if ($scope.axis === "X") { a = ($scope.size-1)-x_ ; b = y_ ; c = $scope.layer }
					if ($scope.axis === "Y") { a = ($scope.size-1)-y_ ; b = $scope.layer ; c = x_ }

					// switch ($scope.tool) {
					// 	case "add":    $scope.matrix[a][b][c] = $scope.color; break
					// 	case "change": $scope.matrix[a][b][c] = $scope.color; break
					// 	case "remove": $scope.matrix[a][b][c] = undefined; break
					// }

					if (p.mouseButton === "left")  $scope.matrix[a][b][c] = $scope.color;
					if (p.mouseButton === "right") $scope.matrix[a][b][c] = undefined;
				}

				refresh = false
			}
		}

		p.mouseReleased = () => refresh = true
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