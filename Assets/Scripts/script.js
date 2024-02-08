$(function() {
const forecast = document.getElementById("forecast");
const submit = document.getElementById("submit");
const search = document.getElementById("search");
const city = document.getElementById("city")
const icon = document.getElementById("icon");
const temp = document.getElementById("temp");
const wind = document.getElementById("wind")
const humidity = document.getElementById("humidity");
const savedCities = document.getElementById("savedCities");
const APIkey = "170f1ca47747fd29c00e9b5402300771"
const cityArray = JSON.parse(localStorage.getItem("cityArray")) || [];

// Adds the buttons under the search query
function addButtons() {
    savedCities.innerHTML = "";
    search.value = "";
    for (const city of cityArray) {
        const newBtn = document.createElement("input");
        newBtn.setAttribute("type", "button")
        newBtn.classList.add("mt-3");

        newBtn.value = city;

        newBtn.addEventListener("click", () => {
            getCoords(city);
        })
        
        savedCities.appendChild(newBtn);
    }
}

// Checks if the input isn't empty
function input(event) {
    event.preventDefault();
    let text = search.value.trim();

    if (text === "") {
        return;
    } else {
        getCoords(text);
    }
}

// Gets the coordinates of the city
function getCoords(item) {
    const city = `http://api.openweathermap.org/geo/1.0/direct?q=${item}&limit=1&appid=${APIkey}`
    
    fetch(city)
        .then(response => {
            return response.json();
        })
        .then(data => {
            getWeather(data[0].lat, data[0].lon);
        }).catch(() => {
            console.log(`There was an invalid city`);
        });
}

// Gets the weather of the city
function getWeather(lat, lon) {
    const weather = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${APIkey}`

    fetch(weather)
        .then(response => {
            if(response.status !== 200) {
                console.log("Invalid City");
            }
            return response.json();
        })
        .then(data => {
            const temp = cityArray.find((city) => city === data.city.name)

            if (!temp) {
                if (cityArray.length === 8) {
                    cityArray.pop();
                    cityArray.unshift(data.city.name);
                } else {
                    cityArray.push(data.city.name);
                }
                
                cityArray.splice(8)

                localStorage.setItem("cityArray", JSON.stringify(cityArray));
                addButtons();
            }

            generateDay(data);
        })
}

// Generates the cards for the forecast and updates the current weather
function generateDay(data) {
    forecast.innerHTML = '';

    city.innerHTML = data.city.name + " " + `(${dayjs().format('M/D/YYYY')})`;
    icon.src = `https://openweathermap.org/img/wn/${data.list[0].weather[0].icon}@2x.png`;
    temp.innerHTML = data.list[0].main.temp + " °F";
    wind.innerHTML = data.list[0].wind.speed + " MPH";
    humidity.innerHTML = data.list[0].main.humidity + "%";

    for (let i = 1; i <= 5; i++) {
        let b = dayjs().add(i, 'days').format("YYYY-MM-DD");

        let c = data.list.find((date) => date.dt_txt === b + " 12:00:00");
        
        
        const div = document.createElement("div");
        const forecastDiv = document.createElement("div");
        const h5 = document.createElement("h5");
        const img = document.createElement("img");
        const statDiv = document.createElement("div");
        const temperature = document.createElement("p")
        const wind = document.createElement("p")
        const humidity = document.createElement("p");

        forecast.appendChild(div);
        div.appendChild(forecastDiv)
        forecastDiv.appendChild(h5)
        forecastDiv.appendChild(img);
        forecastDiv.appendChild(statDiv);
        statDiv.appendChild(temperature);
        statDiv.appendChild(wind);
        statDiv.appendChild(humidity);
        
        forecastDiv.setAttribute("class", "ms-2 py-1");
        img.setAttribute("src", `https://openweathermap.org/img/wn/${c.weather[0].icon}@2x.png`)

        h5.textContent = dayjs.unix(c.dt).format('M/D/YYYY');
        temperature.textContent = `Temp: ${c.main.temp}` + " °F";
        wind.textContent = `Wind: ${c.wind.speed} MPH`;
        humidity.textContent = `Humidity: ${c.main.humidity}%`;
    
    }
}   
submit.addEventListener("click", input);
window.addEventListener("load", addButtons());
})
