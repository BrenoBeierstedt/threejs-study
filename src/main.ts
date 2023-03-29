import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import * as dat from 'dat.gui' 

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})
const assetLoader = new GLTFLoader();

const objects = [];

// gui 

const modelFileList = {
	'Barge': '../assets/barge.gltf',
	'Container ship': '../assets/container_ship.gltf',
	'Oil tanker': '../assets/oil_tanker.gltf',

};
type DayTimeList = {
	'Sunrise': object,
	'Noon': object,
	'Sunset': object,
	'Night': object,

};
const dayTimeList = {
	'Sunrise': { 'skyColor': 0xff6700, 'groundColor': 0x118aaf},
	'Noon': { 'skyColor': 0xffffff, 'groundColor': 0x57B8BC},
	'Sunset': { 'skyColor': 0xff6700, 'groundColor': 0x005F7D},
	'Night': { 'skyColor': 0x575db6, 'groundColor': 0x0a0b38},
};

const dayTimeOptions = [
	'Sunrise',
	'Noon',
	'Sunset',
	'Night',

];
const gui = new dat.GUI
const guiData = {
	modelFileName: modelFileList[ 'Barge' ],
    bgColor:  0xFFFFFF,
	dayTimeOption: 'Noon',
	dayTime: dayTimeList['Noon'],
	toggleEdit: false,

};
renderer.setClearColor( guiData.bgColor, 1 )
gui.add( guiData, 'modelFileName', modelFileList ).name( 'Asset' )
gui.addColor( guiData, 'bgColor' ).name( 'Background color' ).onChange(() => renderer.setClearColor( guiData.bgColor, 1 )
)
gui.add( guiData, 'dayTimeOption', dayTimeOptions ).name( 'Daytime' ).onChange((e) => { 
	scene.remove(light);
	light =  new THREE.HemisphereLight( dayTimeList[ e as keyof DayTimeList ].skyColor,
	dayTimeList[ e as keyof DayTimeList ].groundColor, 2 )
	scene.add(light);
})
gui.add( guiData, 'toggleEdit').name( 'Edit' )

const width = window.innerWidth
const height = window.innerHeight

renderer.setSize(width, height)

const scene = new THREE.Scene

const camera = new THREE.PerspectiveCamera(
	45,
	width / height,
	0.1,
	1000
)

let light =  new THREE.HemisphereLight( guiData.dayTime.skyColor, guiData.dayTime.groundColor, 2 );
light.position.set(1, 1, 1)

scene.add(light)

const orbit = new OrbitControls(camera, renderer.domElement)

camera.position.set(10, 15, -22)

orbit.update()

const planeMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
		visible: false,
	})
);

planeMesh.rotateX(-Math.PI / 2);
planeMesh.name = 'ground'
scene.add(planeMesh)

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);


const highlightMesh = new THREE.Mesh(
	new THREE.PlaneGeometry(1, 1),
	new THREE.MeshBasicMaterial({
		side: THREE.DoubleSide,
	})
);

highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh)


const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function (e) {
	mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
	mousePosition.y = -(e.clientY / this.window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(mousePosition, camera);
	intersects = raycaster.intersectObjects(scene.children);

	intersects.forEach(function (intersect) {

		if (intersect.object.name === 'ground') {
			const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
			highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

			const objectExist = objects.find(function (obj) {
				return (obj.position.x === highlightMesh.position.x)
					&& (obj.position.z === highlightMesh.position.z)
			})
			if(guiData.bgColor == 0xffffff) highlightMesh.material.color.setHex(0x000000)

			if (!objectExist && guiData.bgColor !== 0xffffff) highlightMesh.material.color.setHex(0xFFFFFF)
			if (objectExist) highlightMesh.material.color.setHex(0xFF0000)

		}
	})
})

window.addEventListener('click', function () {
if(guiData.toggleEdit === false){
	// var intersects = raycaster.intersectObject(scene, true);

if (intersects.length > 0) {
	
    var object = intersects[0].object;
    object.material.color.set( Math.random() * 0xffffff );
}
}
else {






const objectExist = objects.find(function (obj) {
	return (obj.position.x === highlightMesh.position.x)
		&& (obj.position.z === highlightMesh.position.z)
})

if (!objectExist && guiData.toggleEdit ) {

	intersects.forEach(function (intersect) {
		if (intersect.object.name === 'ground') {

			assetLoader.load(guiData.modelFileName, function (gltf) {
				const model = gltf.scene.clone();
				scene.add(model);
				objects.push(model)
				model.position.copy(highlightMesh.position)
				return model
			}, undefined, function (error) {
				console.error(error)
			})

			highlightMesh.material.color.setHex(0xFF0000)
		}
	})
}
}
})


function animate() {
	renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
	camera.aspect = this.window.innerWidth / this.window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height)
})

