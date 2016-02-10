// We are going to continue using the World Bank Data.
//
// In this exercise we are going to build a tree map of our data instead of
// the scatterplot.

var viewer = d3.select("#visuals");

// define variables:
// - the width of our SVG
var width = 800;
// - the height of the SVG
var height = 600;
// - the current year we're inspecting:
var year = 2008;

var indicators = ["life_expectancy","internet_users","population",
  "urban_popoulation","gdp", "gdp_pcap", "income"];
var validNations;

var indicator = "income";

// create an svg element with the dimensions we setup
// above
var svg = viewer.append("svg")
  .attr("height", height)
  .attr("width", width);

var regionScale;

// Task 1: Create a tree map layout
// It should:
// - have a padding of 4
// - have a size of width x height
// - make sure that the children function is defined and passing the d.values
// - make sure that the value function is define and returns the current indicator value.
var treemap = d3.layout.treemap()
  .padding(4)
  .size([width, height])
  .children(function(d) {
    return d.values;
  })
  .value(function(d) {
    return d.current[indicator];
  });


d3.json("../assets/countrydata.json", function(error, data) {

  if (error) {
    console.log(JSON.stringify(error));
  }

  regionScale = findRegions(data);
  calcCurrent(data, year);

  function plotTreemap() {

    validNations = data.filter(function(country){
      return country.current[indicator];
    });

    // transform data to be heirarchical by region. Note that we need to get it
    // into a heirarchical form so that we can render the map. Now the data is in a
    // tree structure. See the output in the console.
    var world = {
      name : "world",

      // aggregate the valid counties by their regions.
      values: d3.nest()
        .key(function(d) {
          return d.region;
        })
        .entries(validNations)

        // the tree map expects the name of a node to be under the "name"
        // property, and you can't overwrite that unfortunetly. As such once
        // we get the results, where instead of name the property is "key" we
        // need to re-map it back to "name"
        .map(function(n) {
          return { name : n.key, values : n.values };
        })
    };

    // This is your data binding! Note that we are using treemap.nodes which
    // flattens our data structure back down to a single array that has every
    // country and its positioning and sizing information.
    // Each datum now has the following properties:
    //
    // parent - the parent node, or null for the root.
    // children - the array of child nodes, or null for leaf nodes.
    // value - the node value, as returned by the value accessor.
    // depth - the depth of the node, starting at 0 for the root.
    // x - the minimum x-coordinate of the node position.
    // y - the minimum y-coordinate of the node position.
    // dx - the x-extent of the node position.
    // dy - the y-extent of the node position.
    var cell = svg.data([world]).selectAll("g")
      .data(treemap.nodes)

    // create a group element for each cell.
    // Inside of it we will put our rect & text label.
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    // Task 2:
    // append a rect to the cell. Set its:
    // - width
    // - height
    // - fill (use the regionScale to color by. Only set the color if the node has
    // children (because it's children will lay on top of it and won't need their
    // own color.))
    cell.append("rect")
      .attr("width", function(d) { return d.dx; })
      .attr("height", function(d) { return d.dy; })
      .style("fill", function(d) { return d.children ? regionScale(d.name) : null; });

    // Task 3:
    // For each cell append a text node. Set its:
    // - x (to half the width)
    // - y (to half the height)
    // - dy (to 0.35em)
    // - text-anchor (to middle)
    // text (to the value of d.name. Note you only want to set the value of the nodes
    // that no longer have any children (aka the countries, not regions.))
    cell.each(function(d) {
      if (d.dx > 50 && d.dy > 20 && d.name.length < 19) {
        d3.select(this).append("text")
        .attr("x", function(d) { return d.dx / 2; })
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.children ? null : d.name; });
      }
    });

  }

  plotTreemap();
});