// We are going to continue using the World Bank Data.
//
// In this exercise we are going to animate our circles so that
// they move across time, from 1960 - 2008.

var viewer = d3.select("#visuals");

// ==== Data:
// All the raw data
var nations;
// Just the nations to be drawn every cycle.
var validNations;

// ==== Dimensions:
var margin = { top : 5, right : 25, bottom : 25, left: 25.5 };
var width = 800 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

// ==== Years:
var startYear = 1960;
var endYear = 2008;
var year = startYear;
var updateInterval = 150;

// ==== Indicators:
var indicators = ["life_expectancy","internet_users","population",
  "urban_popoulation","gdp", "gdp_pcap", "income"];
var xIndicator = "income",
    yIndicator = "life_expectancy",
    rIndicator = "population";

// ==== Containers:
  // - Our svg container
var svg = viewer.append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right),

  // - Our chart container
  chart = svg.append("g")
    .attr("transform", "translate("+margin.left+","+margin.top+")"),

  // - Our circle group (we only want to make that once)
  circleGroup = chart.append("g")
    .classed("circles", true),

  // - A field showing the year we're looking at
  yearField = viewer.append("div")
    .attr("id","year")
    .text(year);

// ==== Scales:
  // - Our region color scale
var regionScale = d3.scale.ordinal(),

  // - Our x position scale, note it's a log scale!
  xScale = d3.scale.log().range([0, width]),

  // - Our y position scale
  yScale = d3.scale.linear().range([height, 0]),

  // - Our radius scale, note it's a square root scale because it's an area.
  radiusScale = d3.scale.sqrt().range([4,40]);

// ==== Axes helpers, x & y
var xAxis = d3.svg.axis()
    .orient("bottom")
    .ticks(12, d3.format(",d")),
  yAxis = d3.svg.axis()
    .orient("left");

d3.json("/assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  nations = data;

  // populate app.regions so that we can color the circles
  // according to a region scale.
  findRegions(data);

  xScale.domain(calcExtents(data, xIndicator));
  yScale.domain(calcExtents(data, yIndicator));
  radiusScale.domain(calcExtents(data, rIndicator));

  createAxes();
  draw();

});

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

function plotCircles(data) {

  validNations = data.filter(function(country){
    return country.current[xIndicator] &&
      country.current[yIndicator] &&
      country.current[rIndicator];
  });

  var circleDataBinding = circleGroup.selectAll("circle.nation")
    .data(validNations, function(country) {
      return country.name;
    });

  var enteringCircles = circleDataBinding.enter();
  var currentCircles = circleDataBinding;
  var exitingCircles = circleDataBinding.exit();

  // TASK 1:
  // Update the entering circle selection to start off with the following:
  // - r attribute should be set to 1e-8 (we'll start with a zero radius)
  // - fill-opacity style should be also set to 1e-8 (we'll start with an
  //    invisible circle)
  // - fill
  enteringCircles.append("circle")
    .classed("nation", true)
    .style("fill", function(d) {
      return regionScale(d.region);
    })
    // Set "r" here
    // Set "fill-opacity here"
    .attr("r", 1e-8)
    .style("fill-opacity", 1e-8);

  // TASK 2:
  // For all circles currently rendered (aka, those that stayed and those
  // that are new):
  // - add a transition
  // - of duration updateInterval (as defined above)
  // - of ease "linear"
  // On that transition:
  //  - Set the attributes r, cx and cy as they were previously set! We are
  //    going to animate to those.
  //  - Also set the fill-opacity to 1, we should be able to see the circles now.
  //
  // Note we don't want to do the sort on our transition, so we're doing that
  // first. We don't do the sort as part of the new entering circles because we
  // need to take all the visible circles and resort them.
  currentCircles
    .sort(function(a, b) {
      return b.current[rIndicator] - a.current[rIndicator];
    })
    .transition()
    .duration(updateInterval)
    .ease("linear")
    .attr("r", function(d) { return radiusScale(d.current[rIndicator]); })
    .attr("cx", function(d) { return xScale(d.current[xIndicator]); })
    .attr("cy", function(d) { return yScale(d.current[yIndicator]); })
    .style("fill-opacity", 1);

  // TASK 3:
  // The exiting circles should start a transition that will be half
  // the duration of the update interval and will also ease linearly.
  // It should reset the radius and fill opacity to 1e-8 (we want the
  // circles to disappear).
  // At the end of the transition we want to remove the circles altogether.
  exitingCircles
    .transition()
      .duration(updateInterval/2)
      .attr("r", 1e-8)
      .style("fill-opacity", 1e-8)
      .remove();
}

// Our draw loop!
function draw() {

  // update year field
  yearField.text(year);

  // recalculate the "current" values for the year
  calcCurrent(nations, year);

  // plot the circles
  plotCircles(nations);

  // increment year and animate the next year!
  if (++year <= endYear) {
    setTimeout(draw, updateInterval);
  }
}


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