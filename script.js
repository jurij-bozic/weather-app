import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import {OrbitControls} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/examples/jsm/loaders/GLTFLoader.js';


const apiKey = "4d8fb5b93d4af21d66a2948710284366";
const input = document.querySelector("#search-input");
const form = document.querySelector("#search-form");
const dayName = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
let prevTargetId;

function getWeatherData(url1){
    //fetches locaation coordinates based on location name
    fetch(url1)
    .then(response => response.json())
        .then(function(data){
            let lat = data.coord.lat;
            let lon = data.coord.lon;
            let urlWeather = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

            //fetches  7-day weather forecast based on location coordinates
            fetch(urlWeather).then(response => response.json())
            .then(function(dailyData){

                document.getElementById('location').textContent = input.value.charAt(0).toUpperCase() + input.value.slice(1);

                //loops over the 7-day forecast and generates DOM-elements
                for(let i=0; i<dailyData.daily.length-1; i++){
                    let params = [
                        ['container', 'selected', 'day-selection'],
                        ['img', 'img-container', '-container'],
                        ['svg', "svg-dimensions icons-2d-props icons-2d-" + (dailyData.daily[i].weather[0].main == 'Clear' ? 'Sun' : dailyData.daily[i].weather[0].main), '-img'],
                        ['degrees', 'degrees-card', '-container']
                    ];

                    params.map(function(item, index){
                        generateDomEl('DIV', item[0], item[1], item[2], dailyData, i, (index==0 ? null : true), (index==0 ? true : null));
                    });
                }
                //default selection of today's date
                document.getElementById(prevTargetId).click();

                //switches views
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('details-container').classList.remove('details-container');
                document.getElementById('details-container').style.visibility = 'visible'
                document.getElementById('details-container').style.display = 'block';
            })
        });
}

function generateDomEl(element, id, classes, appendSite, data, index, day, defaultClick){
    let node = document.createElement(element);     
    node.setAttribute('id', dayName[new Date(data.daily[index].dt*1000).getDay()] + '-' + id)    
    if(index == 0 && defaultClick){
        prevTargetId = dayName[new Date(data.daily[index].dt*1000).getDay()] + '-' + id; 
    }
    if(classes.includes(' ')){
        classes = classes.split(' ');
        classes.map(item => node.classList.add(item));
    } 
    else {
        node.classList.add(classes);    
    }     
    if(id == 'degrees'){
        node.textContent = Math.floor(data.daily[index].temp.day - 273.15) + '°C';
    }
    //attaches a listener to every day card
    node.addEventListener('click', function(event){
                selectDay(event);
    }, true);
    
    appendSite = (day ? dayName[new Date(data.daily[index].dt*1000).getDay()] + appendSite : appendSite);                    
    document.getElementById(appendSite).appendChild(node); 
}

function setBackground(weather){
    document.getElementById('circle').className = 'circle-' + weather;
}

function selectDay(event){
    let classesOfChild = event.srcElement.children[0].children[0].className.split('-');
    if(prevTargetId){
        document.getElementById(prevTargetId).classList.remove('get-selected');
    }

    document.getElementById('day-name').textContent = event.srcElement.id.split('-')[0];
    document.getElementById('degrees').textContent = event.srcElement.lastChild.textContent; 
    document.getElementById(event.srcElement.id).classList.add('get-selected');

    setBackground(classesOfChild[classesOfChild.length-1]);
    //loads gltf icons and rotates them
    generateImg3D(classesOfChild[classesOfChild.length-1].toLowerCase());

    prevTargetId = event.srcElement.id;
}
//start of 3D graphics loading
function generateImg3D(file) {
    let canvas = document.querySelector('#canvas-3d');
    let renderer = new THREE.WebGLRenderer({canvas, alpha: true});
  
    renderer.setClearColor (0x000000, 0);
  
    let fov = 45;
    let aspect = 2;  // the canvas default
    let near = 0.1;
    let far = 100;
    let camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 10, 20);
  
    let controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
  
    let scene = new THREE.Scene();
    scene.background = null;
  
    let color = 0xf2f2ff;
    let intensity = 1;
    let light = new THREE.DirectionalLight(color, intensity);
      light.position.set(5, 10, 2);
      scene.add(light);
    
    let gltfLoader = new GLTFLoader();
    gltfLoader.load('assets/' + file + '.gltf', (gltf) => {
        let graphics = gltf.scene;
        scene.add(graphics);
  
        let box = new THREE.Box3().setFromObject(graphics);
        let boxSize = box.getSize(new THREE.Vector3()).length();
        let boxCenter = box.getCenter(new THREE.Vector3());
  
        frameArea(boxSize * 0.5, boxCenter, camera);
  
        // update controls for new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      });
    
  
    function render() {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 8;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  function frameArea(sizeToFitOnScreen, boxCenter, camera) {
      const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
      const halfFovY = THREE.MathUtils.degToRad(camera.fov * .4);
      const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

      const direction = (new THREE.Vector3())
          .subVectors(camera.position, boxCenter)
          .multiply(new THREE.Vector3(1, 0, 1))
          .normalize();
  

      camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));
    }

 //listens for form-submit
form.addEventListener("submit", e => {
    e.preventDefault();
    let inputValue = input.value;
    let urlLocation = `https://api.openweathermap.org/data/2.5/weather?q=${inputValue}&appid=${apiKey}&units=metric`;

    document.getElementById('main-home-container').style.display = 'none';
    document.getElementById('loading-screen').style.display = 'block';
    getWeatherData(urlLocation);
})

//listens for back-btn click
document.getElementById('back-btn').addEventListener('click', function(event){
    location.reload();
});








