var body = d3.select(document.body);

// Task 1:
// Above we've defined a selection called "body". It references the
// actual body of our document.
// Change its background color to "khaki" using the `style` function.

body.style('background-color', 'khaki');

// Task 2:
// Now, find a div inside the body that as the id "visuals". Save it to the
// 'viewer' variable, then find a span inside that visuals div.
// Change its content to say "FOUND IT!" using the `text` function
// var viewer = ?
// var span = ?
var viewer = body.select('#visuals');
var span = viewer.select("span");
span.text("FOUND IT!");

// Task 3:
// Append a new div to the "viewer" selection using the `append` class and then
// append three divs to that container with the class name "item" assigned
// to each. Save that selection to the variable 'items_container'.
// Look up how to set the class attribute on an item in the d3 documentation
// or slide material!
// var items_container = ?
var items_container = viewer.append("div");

items_container.append("div").classed("item", true);
items_container.append("div").classed("item", true);
items_container.append("div").classed("item", true);

// Task 4:
// Find all the divs with the class name "item" using the `selectAll` function
// and change their content to say "<b>ITEM DIV</b> using the `html` function"
// var item_divs = ?
var item_divs = viewer.selectAll(".item");
item_divs.html("<b>ITEM DIV</b>");

// Task 5:
// If you look at the index.html file, you'll notice there's a list element in
// our viewer, listing a few animals. Find the one that says 'Dogs' and change
// it to 'Birds'. How would you find it?
// var dogs_li = ?
var dogs_li = viewer.selectAll('li:nth-child(2)');
dogs_li.text("Birds");

// Task 5:
// Find all our animal list li elements and set an attribute on them called
// name. Set that attribute to "animal"
// var animal_lis = ?
var animal_lis = viewer.selectAll("li")
  .attr("name", "animal");

// Task 6:
// Find the input on the page and change its value to your name. Which function
// will you use to set that content? Hint, you may want to look this up in the
// d3 documentation.
// var input = ?
var input = viewer.select("input");
input.property("value", "YOUR NAME");
