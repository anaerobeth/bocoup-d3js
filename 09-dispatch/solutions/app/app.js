// We are going to continue using the World Bank Data.
//
// In this exercise we are going to use d3's dispatch functionality to
// enable some mouse interactions.

var viewer = d3.select("#visuals");

  // ==== Data:
// All the raw data
var nations;
// Just the nations to be drawn every cycle.
var validNations;
// a nation -> datum map - for easier lookups of nation data by name.
var nationDictionary = {};

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
    .text(year),

  // - An area for our map
  map = chart.append("g")
    .classed("map", true)
    .attr("transform", "translate(" + (width - 100) + "," + (height - 100) + ")");

// ==== Scales:
  // - Our region color scale
var regionScale,

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

var dispatch = d3.dispatch("country_select", "country_select_end");

d3.json("../assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }


  // save our data
  nations = data;

  // build a nation dictionary so we can access region data
  nations.forEach(function(nation) {
    nationDictionary[nation.name] = nation;
  });

  // populate app.regions so that we can color the circles
  // according to a region scale.
  regionScale = findRegions(data);

  createMap();

  xScale.domain(calcExtents(data, xIndicator));
  yScale.domain(calcExtents(data, yIndicator));
  radiusScale.domain(calcExtents(data, rIndicator));

  createAxes();
  draw();

});

// Renders a small choropleth map as a legend that is colored by region.
function createMap() {

  // Create a default mercator projection that we will use for our map.
  // What other projections can we use?
  var projection = d3.geo.mercator()

    // we don't need to translate our map since it's the entire world!
    .translate([0, 0])

    // let's scale it down
    .scale(width / 24);

  // Create a new geographic path generator with our projection
  var path = d3.geo.path()
    .projection(projection);

  // fetch our geo data
  d3.json("../assets/countrygeo.json", function(error, world) {

    if (error) {
      console.log(error);
    }

    // create a data binding between our data features and new path elements.
    // we will render each country at a time.
    var dataBinding = map.selectAll("path")
      .data(world.features);

    // country enter selection
    var enteringCountries = dataBinding.enter();

    enteringCountries.append("path")
      // use our path generator to actually produce the path
      .attr("d", path)

      // set a name attribute on each path so we can find it later
      .attr("name", function(d) { return d.properties.name; })

      // determine the fill based on the region the country fits in. Use
      // the country name from the geo data to look up the country metadata
      // in our nation dictionary, then use that region info to determine
      // the color. If we had region information as part of our geo file we
      // wouldn't need to do this.
      // Some countries in our geo file will not have corresponding entries
      // in our data, so just color those a light grey.
      .style("fill", function(d) {
        if (nationDictionary[d.properties.name]) {
          return regionScale(nationDictionary[d.properties.name].region);
        } else {
          console.log(d.properties.name);
          return "#eee";
        }
      });

    // TASK 3:
    // Bind to the two dispatch functions we have.
    // - when country_select is triggered, use the first parameter (Which is
    // the country name) to find the appropriate path element and set its
    // fill opacity to 0.5
    // - when country_select_end is triggered, use the first parameter (which
    // is also the country name) to find the appropriate path element and
    // restore its fill opacity to 1.
    dispatch.on("country_select", function(name) {
      map.select("path[name='" + name + "']").style("fill-opacity", 0.5);
    });
    dispatch.on("country_select_end", function(name) {
      map.select("path[name='" + name + "']").style("fill-opacity", 1);
    });

  });
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

  enteringCircles.append("circle")
    .classed("nation", true)
    .style("fill", function(d) {
      return regionScale(d.region);
    })
    // Set "r" here
    // Set "fill-opacity here"
    .attr("r", 1e-8)
    .style("fill-opacity", 1e-8)

    // TASK 1:
    // Send a dispatch to country_select with the name of
    // the specific countyr being moused over.
    .on("mouseover", function(d) {
      dispatch.country_select(d.name);
    })

    // TASK 2:
    // Send a dispatch to country_select_end with the name
    // of the specific country being moused out.
    .on("mouseout", function(d) {
      dispatch.country_select_end(d.name);
    });

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

  exitingCircles
    .transition()
      .duration(updateInterval/2)
      .attr("r", 1e-8)
      .style("fill-opacity", 1e-8)
      .remove();
}