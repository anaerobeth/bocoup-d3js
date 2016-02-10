// find all the regions we have available and define
// our color scale
function findRegions(data) {
  var regions = [];
  var regionScale = d3.scale.ordinal();
  data.forEach(function(country) {
    if (regions.indexOf(country.region) === -1 &&
      country.region &&
      country.region.length > 0) {
      regions.push(country.region);
    }
  });

  // define our scale
  regionScale
    .domain(regions)
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
      "#e377c2","#7f7f7f","#bcbd22","#17becf"]);

  return regionScale;
}

function createAxes() {
  // set the scales on our axes.
  xAxis.scale(xScale);
  yAxis.scale(yScale);

  // container for the x axis
  chart.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);

  // Create the container for the y axis.
  chart.append("g")
    .attr("class", "y axis")
    .call(yAxis);
}
// Calculates the current values for all indicators for a specific year.
// Adds a "current" property to each country row where the indicator name
// equals the value for that specific year, if one exists. Otherwise it will
// be set to null.
function calcCurrent(data, year) {
  // for each country in our dataset:
  data.forEach(function(country) {

    // iterate over each of the indicators we want to find the latest
    // value for the year by finding the data point with that year
    indicators.forEach(function(indicator) {

      // create a new property called current that
      // will contain the values for the specific year
      // we are operating in.
      country.current = country.current || {};
      country.current[indicator] = null;

      // if the country has values for this indicator to begin with...
      if (country[indicator]) {
        country[indicator].forEach(function(datum) {
          if (datum.year === year) {
            country.current[indicator] = datum.value;
          }
        });
      }
    });
  });
}

// Calculates the extents of the data for a specific indicator. Extents are
// are the bounds of our data. For example, the array [1,2,3,4] has the extent
// [1,4]. In order to get a consistent extent for our scale (that won't shift as
// we change years,) we need to go through all the years and all the countries
// and find the min and max of those.
function calcExtents(data, indicator) {

  // first find all the data points for a specific indicator across
  // all countries and join them into one array.
  var allValues = data.map(function(country) {
    return country[indicator];
  }).reduce(function(values, current) {
    return values.concat(_.compact(current));
  }, []);

  // now go through all the data points and find the extent using d3's
  // `extent` function.
  var extent = d3.extent(allValues, function(d) {
    return d.value;
  });

  return extent;
}