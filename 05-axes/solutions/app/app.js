// We are going to continue using the World Bank Data.
//
// In this exercise we are going to add axes to our scatterplot for the x
// and y axes.

var viewer = d3.select("#visuals");

// define variables:

// define some margins we're going to use, then adjust the height and width
// to use them as well.
var margin = { top : 5, right : 25, bottom : 25, left: 25.5 };
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// - the current year we're inspecting:
var year = 2008;

var indicators = ["life_expectancy","internet_users","population",
  "urban_popoulation","gdp", "gdp_pcap", "income"];
var validNations;

var xIndicator = "income",
    yIndicator = "life_expectancy",
    rIndicator = "population";

// create an svg element with the dimensions we setup above
var svg = viewer.append("svg")
  .attr("height", height + margin.top + margin.bottom)
  .attr("width", width + margin.left + margin.right);
var chart = svg.append("g")
  .attr("transform", "translate("+margin.left+","+margin.top+")");

var regionScale = d3.scale.ordinal();

var xScale = d3.scale.log().range([0, width]);
var yScale = d3.scale.linear().range([height, 0]);
var radiusScale = d3.scale.sqrt().range([4,40]);

// TASK 1:
// define axis helpers for x & y.
// Our x axis should orient to the bottom, and have 12 ticks formatted
// to add a "," to the numbers at the appropriate places.
// The y axis should orient to the left.
var xAxis = d3.svg.axis()
    .orient("bottom")
    .ticks(12, d3.format(",d")),
  yAxis = d3.svg.axis()
    .orient("left");

d3.json("../assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  // populate app.regions so that we can color the circles
  // according to a region scale.
  findRegions(data);

  // find current indicator values for a specfic year. This will
  // add a property to each country object called 'current'
  // that will have a value for each available indicator (which you can
  // see in an array above.)
  calcCurrent(data, year);

  xScale.domain(calcExtents(data, xIndicator));
  yScale.domain(calcExtents(data, yIndicator));
  radiusScale.domain(calcExtents(data, rIndicator));

  function createAxes() {
    // TASK 2:
    // set the scales on our axes.
    // Note that the way an axis knows how to render itself is through the
    // use of an existing scale (which is very convenient!) Set the appropriate
    // scale on our axes.
    xAxis.scale(xScale);
    yAxis.scale(yScale);

    // container for the x axis
    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(xAxis);

    // TASK 3:
    // Create the container for the y axis. see the above example of
    // creating the container for the x axis. Do you actually need to
    // transform it anywhere? What class names should it have?
    // container for the y axis
    // chart.append...?
    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);
  }

  function plotCircles() {

    validNations = data.filter(function(country){
      return country.current[xIndicator] &&
        country.current[yIndicator] &&
        country.current[rIndicator];
    });

    var circleGroup = chart.append("g")
      .classed("circles", true);

    var circleDataBinding = circleGroup.selectAll("circle.nation")
      .data(validNations, function(country) {
        return country.name;
      });

    var enteringCircles = circleDataBinding.enter();

    enteringCircles.append("circle")
    .classed("nation", true)
    .attr("r", function(d) { return radiusScale(d.current[rIndicator]); })
    .attr("cx", function(d) { return xScale(d.current[xIndicator]); })
    .attr("cy", function(d) { return yScale(d.current[yIndicator]); })
    .style("fill", function(d) {
      return regionScale(d.region);
    })
    .sort(function(a, b) {
      return b.current[rIndicator] - a.current[rIndicator];
    });
  }

  createAxes();
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
  regionScale
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
      "#e377c2","#7f7f7f","#bcbd22","#17becf"])
    .domain(regions);
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