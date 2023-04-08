const yourWeather = document.querySelector('.your_weather');
const searchWeather = document.querySelector('.search_weather');
const inputContainer = document.querySelector('.search_form_container');
const inputField = document.querySelector('.search_city');
const loaderContainer = document.querySelector('.loading_container');
const showInfoContainer = document.querySelector('.show_weather_info_container');
const grantLocationContainer = document.querySelector('.grant_location_container');
const grantAccessButton = document.querySelector('.grant_access_button');
let notFoundContainer = document.querySelector('.not_found_container');

const API_key = "d1845658f92b31c64bd94f06f7188c9c";

// initially making the "your weather" tab as selected by default
let currTab = yourWeather;
currTab.classList.add('current_tab');


// function to handle tab switches
function handleTabSwitch(clickedTab){
    if(currTab !== clickedTab) {
        currTab.classList.remove('current_tab');
        currTab = clickedTab;
        currTab.classList.add('current_tab');
    }

    // displaying each tab's corresponding UI
    if(currTab === searchWeather) {
        showInfoContainer.classList.remove('active');
        grantLocationContainer.classList.remove('active');
        inputContainer.classList.add('active');
    }
    else {
        inputContainer.classList.remove('active');

        // checking if the user co-ordinates are stored ni the session storage or not
        // if yes then display his city weather 
        const localCoordinates = sessionStorage.getItem("user-coordinates");
        if (!localCoordinates) {
            grantLocationContainer.classList.add("active");
        } 
        else {
            const coordinates = JSON.parse(localCoordinates);
            getUserWeatherFromCoords(coordinates);
        }
    }
    
}
handleTabSwitch(currTab);


// rendering the data received on the UI
function renderInfoOnUI(data) {
    showInfoContainer.classList.add('active');

    // fetching required fields
    const cityNameToShow = document.querySelector('.city_name');
    const countryFlag = document.querySelector('.country_icon');
    const weatherType = document.querySelector('.weather_type');
    const weatherImage = document.querySelector('.weather_image');
    const temperature = document.querySelector('.temperature');
    const windSpeed = document.querySelector('.speed_of_wind');
    const humidityPercent = document.querySelector('.humidity_percentage')
    const cloudsPercentage = document.querySelector('.clouds_percentage');

    // inserting dynamic data in the above fetched fields
    if(data?.cod !== "404"){
        notFoundContainer.classList.remove('active');

        cityNameToShow.innerHTML = data?.name;
        countryFlag.src = `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
        weatherType.textContent = data?.weather?.[0]?.main;
        weatherImage.src = `http://openweathermap.org/img/w/${data?.weather?.[0]?.icon}.png`;
        temperature.textContent = `${data?.main?.temp} °C`;
        windSpeed.textContent = `${data?.wind?.speed}m/s`;
        humidityPercent.textContent = `${data?.main?.humidity}%`;
        cloudsPercentage.innerHTML = `${data?.clouds?.all}%`;
    }
    else {
        notFoundContainer.classList.add('active');
        showInfoContainer.classList.remove('active');
    }
    
}



// will be called when user eneters a city to search 
async function fetchEnteredCityWeather(cityName) {

    try {
        //dispalying the loader
        loaderContainer.classList.add('active');

        showInfoContainer.classList.remove('active');
        notFoundContainer.classList.remove('active');

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_key}&units=metric`);
        const data = await response.json();
        // removing the loader
        loaderContainer.classList.remove('active');

        inputField.value = "";

        renderInfoOnUI(data);
    }
    catch(err) {
        console.log("An Error Occured : " , err);
    }
}


// function  to get user weather using present location's coordinates
async function getUserWeatherFromCoords(coordinates) {
    const { lat, lon } = coordinates;
    
    try{
        //dispalying the loader
        loaderContainer.classList.add('active');

        showInfoContainer.classList.remove('active');
        notFoundContainer.classList.remove('active');

        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`);
        const data = await response.json();

        // removing the loader
        loaderContainer.classList.remove('active');

        renderInfoOnUI(data);
    }
    catch(err){
        console.log("An Error Occurred " , err);
    }
};


// function called by getUserCoordinates() below
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
      sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
      
    grantLocationContainer.classList.remove('active');

    getUserWeatherFromCoords(userCoordinates);
};
// after granting location acees store user coordinates into session storage and call the funcrtio to get his weather
function getUserCoordinates() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert('Geolocation is not supported in this browser');
    }
}



// adding event listeners on the two tabs
yourWeather.addEventListener('click' , ()=>{
    handleTabSwitch(yourWeather);
});
searchWeather.addEventListener('click' , ()=>{
    handleTabSwitch(searchWeather);
});

// adding eventlistener on the input field of "search weather" tab
inputContainer.addEventListener('submit' , (e)=> {
    e.preventDefault();
    fetchEnteredCityWeather(inputField.value);
})

// adding the eventlistener for the grant access button 
grantAccessButton.addEventListener('click' , ()=> {
    getUserCoordinates();
});
