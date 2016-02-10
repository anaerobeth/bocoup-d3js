// We are going to continue using the World Bank Data.
//
// In this exercise we are going to create a small map of the world where
// every country is colored by the region it is in. This time the map will
// be made in canvas

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
  map = viewer.append("canvas")
    .classed("map", true)
    .attr("height", 200)
    .attr("width", 200)
    .style({
      "position": "absolute",
      "top" : (height - 200) + "px",
      "left" : (width - 190) + "px"
    });


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

    // translate our map to center
    .translate([100, 100])

    // let's scale it down
    .scale(30);

  // TASK 1: Set up our context based on our map node. It should
  // be a 2d context.
  // var context = 
  var context = map.node().getContext('2d');

  // TASK 2: Set the context of the path to the context we define above
  var path = d3.geo.path()
    .projection(projection)
    .context(context);

  // fetch our geo data
  d3.json("../assets/countrygeo.json", function(error, world) {

    if (error) {
      console.log(error);
    }

    // Iterate over each of our features, and draw it! Note we aren't
    // using any data binding... we are only drawing it once.
    world.features.forEach(function(d) {

      // Task 2: set the fillStyle on the context. It should be similiar to
      // the way we set up the fill on the svg elements, except now it is
      // saved to context.fillStyle.
      // context.fillStyle = ?
      if (nationDictionary[d.properties.name]) {
        context.fillStyle = regionScale(nationDictionary[d.properties.name].region);
      } else {
        context.fillStyle = '#eee';
      };

      // Task 3: Let's draw!
      // - begin path drawing on the context
      // - call our path function
      // - call the fill
      // - close the path
      context.beginPath();
      path(d);
      context.fill();
      context.closePath();
    });

  });
}
