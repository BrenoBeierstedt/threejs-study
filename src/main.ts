import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import * as dat from 'dat.gui' 
import { LDrawLoader } from 'three/src/extras/loaders/LDrawLoader';
import { LDrawUtils } from 'three/src/extras/loaders/LDrawUtils';
const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})

const modelFileList = {
	'large box': '../assets/box-large.gltf',
	'arrow': '../assets/arrow.gltf',

};

const objects = [];


const width = window.innerWidth
const height = window.innerHeight

const largeBoxUrl = new URL('../assets/box-large.gltf', import.meta.url)

renderer.setSize(width, height)

const scene = new THREE.Scene

const camera = new THREE.PerspectiveCamera(
	45,
	width / height,
	0.1,
	1000
)

const light = new THREE.DirectionalLight(0xFFFFFF, 1)
light.position.set(1, 4, 2)

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
			if (!objectExist) highlightMesh.material.color.setHex(0xFFFFFF)
			else highlightMesh.material.color.setHex(0xFF0000)
		}
	})
})

window.addEventListener('mousedown', function () {
	const objectExist = objects.find(function (obj) {
		return (obj.position.x === highlightMesh.position.x)
			&& (obj.position.z === highlightMesh.position.z)
	})
console.log(guiData.modelFileName)
	if (!objectExist) {

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
})

const assetLoader = new GLTFLoader();

function animate() {
	renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
	camera.aspect = this.window.innerWidth / this.window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height)
})

// gui 
const gui = new dat.GUI
const guiData = {
	modelFileName: modelFileList[ 'large box' ],

};

gui.add( guiData, 'modelFileName', modelFileList ).name( 'Model' )


