// Create the renderer
var canvas = $("#canvas");
var renderer = new THREE.WebGLRenderer({canvas:canvas[0]});
renderer.setSize(canvas.innerWidth(), canvas.innerHeight());
renderer.shadowMap.enabled = true;

// Create the scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
    30, canvas.innerWidth() / canvas.innerHeight(), 0.1, 1000);
//var cam_halfwidth = 10 * canvas.innerWidth() / canvas.innerHeight();
//var camera = new THREE.OrthographicCamera(
//        -cam_halfwidth, cam_halfwidth, -10, 10, 0.1, 1000);
//var ambient = new THREE.AmbientLight(0x404040);

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 20;
camera.up = new THREE.Vector3(0,1,0);
camera.lookAt(new THREE.Vector3(0,0,0));
camera.updateProjectionMatrix();

// Add lights from each direction, so the cube casts a shadow.
[[0xff8080,10,0,0], [0x80ff80,0,10,0], [0x8080ff,0,0,10]].forEach(
    function(lightSpec) {
        var [color, x, y, z] = lightSpec;
        var light = new THREE.DirectionalLight(color, 0.5);
        scene.add(light.target);
        light.position.set(x, y, z);
        light.castShadow = true;
        light.shadow.camera.left = -10;
        light.shadow.camera.bottom = -10;
        light.shadow.camera.right = 10;
        light.shadow.camera.top = 10;
        light.shadow.camera.updateProjectionMatrix();
        scene.add(light);
    });

//// Put lights around the corners of the field.
//[0, 1].forEach(function(a) {
//    [0, 1].forEach(function(b) {
//        [0, 1].forEach(function(c) {
//            var color = new THREE.Color(a*255, b*255, c*255);
//            var light = new THREE.PointLight(color, 1, 100);
//            light.position.set(a * 20 - 10, b * 20 - 10, c * 20 - 10);
//            scene.add(light);
//        });
//    });
//});

// Add a cube, with colors assigned by the normals of the faces,
// and an arrow in its space to represent a vector.
var target = new THREE.Group();
var cube_geometry = new THREE.BoxGeometry(1, 1, 1);
var cube_material = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(cube_geometry, cube_material);
cube.castShadow = true;
target.add(cube);
var arrow = new THREE.ArrowHelper(
    new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,0), 1);
target.add(arrow);
scene.add(target);

var xFloorGeometry = new THREE.PlaneGeometry(20, 20, 32);
var xFloorMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var xFloorPlane = new THREE.Mesh(xFloorGeometry, xFloorMaterial);
xFloorPlane.rotateOnWorldAxis(new THREE.Vector3(0,1,0), Math.PI/2);
xFloorPlane.receiveShadow = true;
xFloorPlane.position.x = -10;
scene.add(xFloorPlane);

var yFloorGeometry = new THREE.PlaneGeometry(20, 20, 32);
var yFloorMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var yFloorPlane = new THREE.Mesh(yFloorGeometry, yFloorMaterial);
yFloorPlane.rotateOnWorldAxis(new THREE.Vector3(1,0,0), -Math.PI/2);
yFloorPlane.receiveShadow = true;
yFloorPlane.position.y = -10;
scene.add(yFloorPlane);

var zFloorGeometry = new THREE.PlaneGeometry(20, 20, 32);
var zFloorMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
var zFloorPlane = new THREE.Mesh(zFloorGeometry, zFloorMaterial);
zFloorPlane.receiveShadow = true;
zFloorPlane.position.z = -10;
scene.add(zFloorPlane);

//var xyGridHelper = new THREE.GridHelper(20, 20);
//xyGridHelper.rotateOnWorldAxis(new THREE.Vector3(1,0,0), Math.PI/2);
//scene.add(xyGridHelper);
//var yzGridHelper = new THREE.GridHelper(20, 20);
//yzGridHelper.rotateOnWorldAxis(new THREE.Vector3(0,0,1), Math.PI/2);
//scene.add(yzGridHelper);
//var xzGridHelper = new THREE.GridHelper(20, 20);
//scene.add(xzGridHelper);

scene.add(new THREE.AxesHelper(5));

//var origin_geometry = new THREE.SphereGeometry(1, 32, 32);
//var origin_material = new THREE.MeshPhongMaterial({color: 0xffffff});
//origin_material.transparent = true;
//origin_material.opacity = 0.8;
//var origin = new THREE.Mesh(origin_geometry, origin_material);
//scene.add(origin);

// Render the scene
function animate() {
    // quat.json should hold an array in the form [x,y,z,w].
    $.ajax({url: "imu.json"})
        .done(function(data) {
            $("#px").text(data.p[0].toFixed(6));
            $("#py").text(data.p[1].toFixed(6));
            $("#pz").text(data.p[2].toFixed(6));
            $("#ox").text(data.o[0].toFixed(6));
            $("#oy").text(data.o[1].toFixed(6));
            $("#oz").text(data.o[2].toFixed(6));
            $("#ow").text(data.o[3].toFixed(6));
            $("#vx").text(data.v[0].toFixed(6));
            $("#vy").text(data.v[1].toFixed(6));
            $("#vz").text(data.v[2].toFixed(6));
            $("#c").text(data.c);

            target.position.set(data.p[0], data.p[1], data.p[2]);
            var rot = new THREE.Quaternion(data.o[0], data.o[1],
                                           data.o[2], data.o[3]);
	    target.quaternion.copy(rot);

            var vect = new THREE.Vector3(data.v[0], data.v[1], data.v[2]);
            arrow.setLength(vect.length());
            vect.normalize()
            arrow.setDirection(vect);

            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        });
}
animate();
