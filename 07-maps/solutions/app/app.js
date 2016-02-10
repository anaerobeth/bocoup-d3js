// We are going to continue using the World Bank Data.
//
// In this exercise we are going to create a small map of the world where
// every country is colored by the region it is in.

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

  // - Our x position scale, note it's a log scale!
var  xScale = d3.scale.log().range([0, width]),

  // - Our y position scale
  yScale = d3.scale.linear().range([height, 0]),

  // - Our radius scale, note it's a square root scale because it's an area.
  radiusScale = d3.scale.sqrt().range([4,40]),

  // - Our region color scale
  regionScale;

// ==== Axes helpers, x & y
var xAxis = d3.svg.axis()
    .orient("bottom")
    .ticks(12, d3.format(",d")),
  yAxis = d3.svg.axis()
    .orient("left");

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

  // populate regions so that we can color the circles
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

  // TASK 1:
  // - Define a new mercator projection,
  // - using the `translate` function translate it to 0,0
  // - using the `scale` function scale it appropriatly, hint it's width divided
  //     by some number...
  //
  var projection = d3.geo.mercator()

    // we don't need to translate our map since it's the entire world!
    .translate([0, 0])

    // let's scale it down
    .scale(width / 24);

  // TASK 2:
  // Create a new geographic path generator and pass it our projection using'
  // the `projection` method
  //
  var path = d3.geo.path()
    .projection(projection);

  // fetch our geo data
  d3.json("../assets/countrygeo.json", function(error, world) {

    if (error) {
      console.log(error);
    }

    // TASK 3:
    // create a data binding for our countries. We will use the "map" element
    // as our base and we will render "path" elements for each country. Our data
    // will actually be the features of the data we just recieved.
    //
    var dataBinding = map.selectAll("path")
      .data(world.features);

    // country enter selection
    var enteringCountries = dataBinding.enter();

    // TASK 4:
    // For our enter selection:
    // - set the path "d" attribute to our path function
    // - set the fill style according to the element's name. You can reach it by
    //   looking in the properties object on each datum. You may want to then
    //   cross reference it with the nation dictionary we defined above to retrieve
    //   the region associated with the country. If we had region information
    //   in this geography file we could use that, but we do not.
    //   Also note that some countries will not have data in our dictionary so
    //   you should color those with the color "#eee".
    //
    enteringCountries.append("path")
      .attr("d", path)
      .style("fill", function(d) {
        if (nationDictionary[d.properties.name]) {
          return regionScale(nationDictionary[d.properties.name].region);
        } else {
          return "#eee";
        }
      });
  });
}