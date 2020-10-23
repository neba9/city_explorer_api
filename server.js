'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const pg = require('pg');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());


//creat our postgers clint 

const client = new pg.Client(process.env.DATABASE_URL);

client.on('error',err=>console.error(err))


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
// app.get('/restaurants', handleRestaurants);
app.get('/weather', handleWeather);
app.get (`/trails`, handleTrailes);

// app.use('*', notFoundHandler);

// HELPER FUNCTIONS


//(1 start )route handler for weather

function handleWeather(req, res){
  let city = req.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  console.log('city', city);

  const URL = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${key}&days=7`;

  
  superagent.get(URL)
    // let weatherArr = [];
      .then(data =>{
        
        //console.log('Object.keys(data.body.data)', Object.keys(data.body.data));
        const  weatherArr = data.body.data.map((value, i)=>{
          //console.log('.map value loop', value);
          return new Weather(value,i)
        });

        //console.log(weatherArr);
        res.status(200).json(weatherArr);
      })
    
      .catch((error)=>{
        console.log('error', error);
        res.status(500).send('something went wrong');
      });
 }

// constarctor function for weather

function Weather(obj){
     this.time = obj.valid_date;
     this.forecast = obj.weather.description;

}
//weathr end


//(2 start)route handler for location 

function handleLocation(req, res){
  let city = req.query.city;
  let key = process.env.GEOCODDE_API_KEY;


  const SQL = `SELECT * FROM locations WHERE search_query=$1`;
  const sqlValue = [city];

  client.query(SQL, sqlValue)
  .then(result=>{
    console.log(result);
    if (result.rows.length) res.status(200).json(result.rows[0]);
    else{
    const URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
    
    superagent.get(URL)
      .then(data =>{
        //console.log(data.body[0]);
  
        let location = new Location(city, data.body[0]);
        console.log('location', location);
        const SQL = `INSERT INTO locations (search_query, latitude, longitude, formatted_query) VALUES ($1,$2,$3,$4)`;
        const sqlValue = [location.search_query,location.latitude,location.longitude,location.formatted_query];
        client.query(SQL,sqlValue);
        res.status(200).json(location);

      })
      .catch((error)=>{
        console.log('error', error);
        res.status(500).send('something went wrong');
      })}
}) 


}
// constarctor function for location 

function Location(city, locationData){
    this.search_query = city;
    this.latitude = locationData.lat;
    this.longitude = locationData.lon;
    this.formatted_query = locationData.display_name;
}

//(2 end 3 start)route handler for trailes 

function handleTrailes(req, res){
  let lat = req.query.latitude;
  let lon =req.query.longitude;
  let key = process.env.TRAIL_API_KEY;


  const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${key}`;

  superagent.get(URL)
      .then(data =>{
        // console.log('weather object', data.body.trails);
        const newArr = data.body.trails.map(value => {
         return new Trails(value); 
        })
         
        // console.log('trails', trails);
         res.status(200).json(newArr);
      })
      .catch((error)=>{
        console.log('error', error);
        res.status(500).send('something went wrong');
      })
}
//constarctor function for Trails

function Trails(trailObj){
    this.name = trailObj.name;
    this.location = trailObj.location;
    this.length = trailObj.length;
    this.stars = trailObj.stars;
    this.star_votes = trailObj.starVotes; 
    this.summary = trailObj.summary;
    this.trail_url = trailObj.url;
    this.conditions = trailObj.conditionStatus;
    this.condition_date = trailObj.conditionDate;
    this.condition_time = trailObj.conditionDetails;

}

//(3 end )


// Make sure the server is listening for requests, firs connect with the database and then connect with server.
client.connect()
.then(()=>{
  
  app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
})


