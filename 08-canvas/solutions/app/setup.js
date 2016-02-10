d3.json = function(dataUrl, callback) {

  if (dataUrl === "../assets/countrygeo.json") {
    return callback(undefined, countrygeo);
  } else {
    return callback(undefined, countrydata);
  }
};