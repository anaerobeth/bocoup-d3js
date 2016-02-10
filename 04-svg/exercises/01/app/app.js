// We are going to continue using the World Bank Data.
//
// In this exercise we are going to render a circle for every sincle country
// as an SVG circle element and color it according to the region.

var viewer = d3.select("#visuals");
var headers = ["Country Name", "Region", "Income Group", "Population"];

// define variables:
// - the width of our SVG
var width = 960;
// - the height of the SVG
var height = 1800;
// - how much space we want between circles
var paddingBetweenCircles = 3;
// - what the radius of a circle will be.
var radius;

var regions, regionScale;

// create an svg element with the dimensions we setup
// above
var svg = viewer.append("svg")
  .attr("height", height)
  .attr("width", width);


d3.json("/assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  // populate regions
  regions = findRegions(data);

  // define our scale
  regionScale = d3.scale.ordinal()
    .domain(regions)
    .range(["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
      "#e377c2","#7f7f7f","#bcbd22","#17becf"]);

  // Task 1:
  // calculate the radius we should be using for each circle
  // take into account how much total vertical space you have using 'height'
  // and how many total circles you're going to draw (the length of data)
  // and don't forget the padding between circles.
  function calcRadius() {
    // Your calculations go here!
    radius = ((height / data.length) - paddingBetweenCircles) / 2
  }

  // find current radius
  calcRadius();

  function plotCircles() {

    // Task 2.1:
    // create a new group container for our circles
    // that has the class name "circles". Remember a group in svg is denoted
    // with a "g" element.

    var circleGroup = svg.append("g")
      .classed("circles", true);

    // Task 2.2:
    // create our circle data binding on our circle group.
    // Make sure to set the correct key function when calling "data"
    // on your selection!
    var binding = circleGroup.selectAll('circle.nation')
      .data(data, function(d) {
        return d.name;
      });
    // Task 2.3:
    // Create en entering selection that you will define new datum behavior
    // on:
    var enteringCircles = binding.enter();


    // Task: 2.4:
    // Now for every entering selection:
    // - append a new circle
      // - set its class name to "nation"
      // - set its "r" attribute to our radius
      // - set its x position to twice the radius (what's the attribute for
      //    positioning a circle along the x axis?)
      // - set its y position to be a multiple of its radius and position in the
      //   data array (don't forget to factor in the padding between circles.)
      // - set its "fill" style attribute to be the fill based on its region (remember
      //   the scale we created? still here.)

     enteringCircles.append('circle')
       .classed('nation', true)
       .attr("r", radius)
       .attr("cx", radius*2)
       .attr("cy", function(country,index) {
         return index * ((radius * 2 + 3) + radius);
       })
       .style('fill', function(d){
         regionScale(d.region);
         });
  }


  plotCircles();
});

function findRegions(data) {
  var regions = [];
  data.forEach(function(country) {
    if (regions.indexOf(country.region) === -1 &&
      country.region &&
      country.region.length > 0) {
      regions.push(country.region);
    }
  });

  return regions;
}