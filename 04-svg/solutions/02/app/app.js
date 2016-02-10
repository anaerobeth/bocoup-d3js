// We are going to continue using the World Bank Data.
//
// In this exercise we are going to render the same circles, except this time
// we are going to position them on an x & y plane according to different
// indicator values. We are also going to size the circles according to the
// population.

var viewer = d3.select("#visuals");
var headers = ["Country Name", "Region", "Income Group", "Population"];

// define variables:
var year = 2008;
// - the width of our SVG
var width = 960;
// - the height of the SVG
var height = 600;
// - how much space we want between circles
var paddingBetweenCircles = 3;
// - what the radius of a circle will be.
var radius;
var regions, regionScale, validNations;

var indicators = ["life_expectancy","internet_users","population",
  "urban_popoulation","gdp", "gdp_pcap", "income"];

// TASK 1
// Define three variables to indicate which variables we will
// be using for which part of the scatterplot. We'll use the income
// for the x scale, the life_expectancy for the y indicator and the
// population for the radius indicator:
//
// var xIndicator = ?
// var yIndicator = ?
// var rIndicator = ?
var xIndicator = "income",
    yIndicator = "life_expectancy",
    rIndicator = "population";

// create an svg element with the dimensions we setup
// above
var svg = viewer.append("svg")
  .attr("height", height)
  .attr("width", width);

// region color scale
var regionScale = d3.scale.ordinal()
  .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
      "#e377c2","#7f7f7f","#bcbd22","#17becf"]);

// TASK 2:
// Define our x and y scales. Note that the xScale should be a log
// scale, whose range goes from 0 to width.
// The y Scale should be a linear scale that goes from height to 0.
// For example, see how we defined the radius scale:
//
// var xScale = ?
// var yScale = ?
var xScale = d3.scale.log().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);
var radiusScale = d3.scale.sqrt().range([4,40]);

d3.json("/assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  // populate regions
  regions = findRegions(data);

  // find current indicator values for a specfic year. This will
  // add a property to each country object called 'current'
  // that will have a value for each available indicator (which you can
  // see in an array above.)
  calcCurrent(data, year);

  // TASK 3:
  // Even though we defined our scales, we have yet to set our domains for
  // them. In order to do that, we need to find all the data points
  // for every indicator, then find the min and the max. We defined a function
  // that does this called calcExtents. You can see it below. Define the domain
  // for all our scales by passing in the result of that function
  // for the appropriate indicator.
  //
  // xScale.domain( ? );
  // yScale.domain( ? );
  // radiusScale.domain( ? );
  //
  xScale.domain(calcExtents(data, xIndicator));
  yScale.domain(calcExtents(data, yIndicator));
  radiusScale.domain(calcExtents(data, rIndicator));

  function plotCircles() {

    // TASK 4:
    // Previously, we rendered a row in our table for every country however
    // now that we're only looking at a specific year, we only want to render
    // those countries that have current values for all our indicators
    // determine which nations have valid data for this year for our x,y and r
    // indicator.
    // filter the data to include only the rows that have a current value for
    // each of our three indicators. You can use the `filter` method on
    // the data array, and in it return true if the indicator values exist.
    //
    // var validNations = data.filter(function(country) {
    //    ???
    // });
    validNations = data.filter(function(country){
      return country.current[xIndicator] &&
        country.current[yIndicator] &&
        country.current[rIndicator];
    });

    var circleGroup = svg.append("g")
      .classed("circles", true);

    var circleDataBinding = circleGroup.selectAll("circle.nation")
      .data(validNations, function(country) {
        return country.name;
      });

    var enteringCircles = circleDataBinding.enter();

    enteringCircles.append("circle")
      .classed("nation", true)

      // TASK 5:
      // Update our attribute values for r, cx, and cy to use our
      // scales. Each of the attributes should use the appropriate
      // scale we defined, pass it the current value for the appropriate
      // indicator.
      // .attr("r", function(d) { ? })
      // .attr("cx", function(d) { ? })
      // .attr("cy", function(d) { ? })
      .attr("r", function(d) { return radiusScale(d.current[rIndicator]); })
      .attr("cx", function(d) { return xScale(d.current[xIndicator]); })
      .attr("cy", function(d) { return yScale(d.current[yIndicator]); })
      .style("fill", function(d) {
        return regionScale(d.region);
      });
  }

  plotCircles();

});

function findRegions(data) {
  regions = [];
  data.forEach(function(country) {
    if (regions.indexOf(country.region) === -1 &&
      country.region &&
      country.region.length > 0) {
      regions.push(country.region);
    }
  });

  // define our scale domain
  regionScale.domain(regions);
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