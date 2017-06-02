Full questionnaire application using ES6, Hapi, ReactJS/Mobx Webpack and Babel. It includes it's own RESTful API server

# Requirements
- `node >= 7.7.1` 
- `npm >= 4.2.1`

(*) not tested on lower versions

### Install & Run

```
npm install
npm start
open http://localhost:3000
```

### Test
```
npm test
```

### Considerations
- No database used. Runs are not persistent
- Server and client contained in this repo for simplicity 
- `server/` folder contains a fully independent project 
- Server and client are prepared to be in different hosts/domains (CORS enabled) 
- Since this is supposed to be a SaaS based system, I focused mostly on the api
- Client not production ready. We'd need a new `webpack.config.js` file in order
to compile the bundle just once, compress code, exclude sourcemaps, etc
- Missing front-end tests. Mostly for AppState.js. I'd also add nightwatch as end to end test framework
- Client not wrapping server responses at this moment (TODO)

