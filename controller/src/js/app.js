import '../scss/global.scss';
import debugPolyfill from './debug/debugPolyfill';
import alfrid, { GL } from 'alfrid';
// import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import Settings from './Settings';
import assets from './asset-list';
import Assets from './Assets';

import Capture from './utils/Capture';
import addControls from './debug/addControls';

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);
}


function _init() {

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		const loader = new AssetsLoader({
			assets:assets
		})
		.on('error', (error)=>{
			console.log('Error :', error);
		})
		.on('progress', (p) => {
			// console.log('Progress : ', p);
			const loader = document.body.querySelector('.Loading-Bar');
			if(loader) loader.style.width = `${(p * 100)}%`;
		})
		.on('complete', _onImageLoaded)
		.start();

	} else {
		_init3D();
	}
}


function _onImageLoaded(o) {
	//	ASSETS
	console.log('Image Loaded : ', o);
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	console.log('Loader :', loader);
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}


function _init3D() {
	let TARGET_SERVER_IP = '192.168.1.69';
	let socket = require('./libs/socket.io-client')(TARGET_SERVER_IP + ':9876');	
	window.socket = socket;

	const btnUseTexture = document.body.querySelector('.useTexture');
	const btnUseColor = document.body.querySelector('.useColor');
	const btnChangeColor = document.body.querySelector('.changeColor');


	btnUseTexture.addEventListener('click', () => {
		socket.emit('useTexture');
	});

	btnUseColor.addEventListener('click', () => {
		socket.emit('useColor');
	});

	btnChangeColor.addEventListener('click', () => {
		socket.emit('changeColor');
	});
	
}