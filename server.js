'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Home Page!');
});

app.get('/bad', (request, response) => {
  throw new Error('poo');
});

// The callback can be a separate function. Really makes things readable
app.get('/about', aboutUsHandler);

function aboutUsHandler(request, response) {
  response.status(200).send('About Us Page');
}

// API Routes
app.get('/location', handleLocation);
app.get('/restaurants', handleRestaurants);
app.get('/weather', handleWeather);

app.use('*', notFoundHandler);

// HELPER FUNCTIONS

function handleWeather (request, response){
  console.log('handleWeather');
  try {
    const data = require('./data/weather.json');
    const weatherdata = [];
    data.data.map(entry => {
      const weather = new Weather(entry);
      weatherdata.push(weather);
      // weatherdata.push(new Weather(entry));
      console.log('weatherdata',weatherdata);
    });
    response.send(weatherdata);
  }
  catch (error) {
    // console.log('ERROR', error);
    handleError(error);
    // response.status(500).send('So sorry, something went wrong.');
  }
}

function Weather(weather){
   this.time = weather.datetime;
   this.forecast = weather.weather.description;
}

function handleLocation(request, response) {
  try {
    const geoData = require('./data/location.json');
    const city = request.query.city;
    const locationData = new Location(city, geoData);
    response.send(locationData);
  }
  catch (error) {
    // console.log('ERROR', error);
    handleError(error);
    // response.status(500).send('So sorry, something went wrong.');
  }
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function handleRestaurants(request, response) {
  try {
    const data = require('./data/restaurants.json');
    const restaurantData = [];
    data.nearby_restaurants.forEach(entry => {
      restaurantData.push(new Restaurant(entry));
    });
    response.send(restaurantData);
  }
  catch (error) {
    // console.log('ERROR', error);
    handleError(error);
    // response.status(500).send('So sorry, something went wrong.');
  }
}

function Restaurant(entry) {
  this.restaurant = entry.restaurant.name;
  this.cuisines = entry.restaurant.cuisines;
  this.locality = entry.restaurant.location.locality;
}

function notFoundHandler(request, response) {
  response.status(404).send('huh?');
}

function handleError(error){
  response.status(500).send(error);
}



// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
