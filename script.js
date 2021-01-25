const apiKey = "d4a765bc1fc872ff1fdb9befc7bb8555";
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
            let weatherNames = {
                Sun: 'sun',
                Clouds: 'cloud',
                Rain: 'cloud-rain',
                Storm: 'bolt',
                Snow: 'snowflake'
            };

            //fetches  7-day weather forecast based on location coordinates
            fetch(urlWeather).then(response => response.json())
            .then(function(dailyData){

                document.getElementById('location').textContent = input.value.charAt(0).toUpperCase() + input.value.slice(1);

                //loops over the 7-day forecast and generates DOM-elements
                for(let i=0; i<dailyData.daily.length-1; i++){
                    let params = [
                        ['container', 'selected', 'day-selection'],
                        ['img', 'img-container', '-container'],
                        ['svg', "svg-dimensions icons-2d-props fas fa-" + weatherNames[(dailyData.daily[i].weather[0].main == 'Clear' ? 'Sun' : dailyData.daily[i].weather[0].main)], '-img'],
                        ['degrees', 'degrees-card', '-container']
                    ];

                    //sun, cloud, cloud-rain, bolt, snowflake

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

    //loads main image for selected day
    generateMainImage(classesOfChild[classesOfChild.length-1].toLowerCase());
    animateWeather(classesOfChild[classesOfChild.length-1].toLowerCase());

    prevTargetId = event.srcElement.id;
}
//sets image for selected day
function generateMainImage(weather){
    document.getElementById('canvas-2d').classList = '';
    document.getElementById('canvas-2d').classList.add('image-2d-' + weather);
}

function animateWeather(weather){

    if(weather == "storm"){
        console.warn('HERE IT IS!');
    }
    let animatables = document.getElementById('drops').children;
    let weatherIcons = {
        rain: 'tint',
        snowflake: 'snowflake',
        cloud: 'cloud',
        sun: 'sun',
        storm: 'bolt'
    };

    for(let i=0; i<animatables.length-1; i++){
        if(Array.from(animatables[i].children[0].classList).indexOf('fas') !== -1){
            animatables[i].children[0].classList = [];
        }
    }

    for(let i=0; i<animatables.length-1; i++){
        if(!animatables[i].id ){
            animatables[i].id = 'drop-' + i;
        }

        if(weather == 'sun' || weather == 'storm'){
            animatables[2].children[0].classList.add('fas', 'fa-' + weatherIcons[weather], 'sun-img', 'scale-in-center');
        }
        else {
            animatables[i].children[0].classList.add('fas', 'fa-' + weatherIcons[weather]);
            if(weather == 'snowflake'){
                animatables[i].children[0].classList.add('snow-rotate');
            }
        }
    }
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

//listens for stats-btn click
document.getElementById('stats-btn').addEventListener('click', function(event){
    document.getElementById('details-container').style.display = 'none';
    document.getElementById('stats-container').style.display = 'block';
});

//listens for go-back button click
document.getElementById('go-back').addEventListener('click', function(event){
    document.getElementById('details-container').style.display = 'block';
    document.getElementById('stats-container').style.display = 'none';
});







