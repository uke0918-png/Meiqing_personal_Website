
(function(){
const educationData = {
  "name": "Drawing",
  "children": [
    {
      "name": "inteerests",
      "children": [
        {
          "name": "2018-2020: Local Art School - Beginner Drawing Classes"
        },
        {
          "name": "2021: Summer Workshop - Digital Illustration Techniques"
        },
        {
          "name": "2022-Present: Mentorship with Local Artist"
        },
        
      ]
    },
 {
      "name": "Projects",
                        "children": [
                        { "name": "Portrait Illustrations" },
                        { "name": "Concept Art for Games" },
                        { "name": "Personal Sketchbook Collections" }
                        ]
                    },
    {
      "name": "Projects",
      "children": [
                            { "name": "Portrait Illustrations" },
                            { "name": "Concept Art for Games" },
                            { "name": "Personal Sketchbook Collections" }
                        ]
                    },
    {
      "name": "Nodes",
      "children": [
        {
          "name":  "Daily Practice (1-2 hours"
        }
      ]
    },
    {
      "name": "Favorites",
      "children": [
        { "name": "Anime Style" },
        { "name": "Realism" }
      ]
    },
    {
      "name": "Achievements",
      "children": [
        {
          "name":  "Art Competition Entries"
        }
      ]
    },
    {
      "name": "Nodes",
      "children": [
        
        
       
      ]
    }
  ]
};

// Responsive dimensions based on content
const margin = { top: 600, right: 300, bottom: 40, left: 80 };
const treeLayout = d3.tree().nodeSize([50, 250]); // Increased horizontal spacing to 250px
const root = d3.hierarchy(educationData);
treeLayout(root);

// Calculate dynamic dimensions
const descendants = root.descendants();
const maxDepth = root.height;
const totalNodes = descendants.length;
const minWidth = totalNodes * 250 + margin.left + margin.right; // Adjusted for larger nodeSize
const minHeight = (maxDepth + 1) * 50 + margin.top + margin.bottom; // Adjusted for larger vertical spacing

const width = Math.min(minWidth, window.innerWidth * 0.9); // Cap width at 90% of viewport
const height = Math.min(minHeight, 1200); // Cap height at 1200px

// Create SVG container
const svg = d3.select("#vis-three")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Apply tree layout
const treeData = treeLayout(root);

// Links
svg.selectAll(".link")
    .data(treeData.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
    .attr("fill", "none")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 2);

// Nodes
const nodes = svg.selectAll(".node")
    .data(treeData.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`);

// Circles
nodes.append("circle")
    .attr("r", 6)
    .attr("fill", "#1a73e8");

// Text labels with improved wrapping
nodes.append("text")
    .attr("dy", "0.35em")
    .attr("x", d => d.children ? -15 : 15) // Increased x offset for better spacing
    .attr("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name)
    .style("font-size", "10px")
    .attr("fill", "#333")
    .call(wrap, 300); // Increased wrap width to 300px for longer labels

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "3px");

// Interactivity
nodes.on("mouseover", function(event, d) {
    d3.select(this).select("circle").attr("fill", d3.rgb("#1a73e8").brighter(0.5));
    tooltip.transition().duration(200).style("opacity", 0.9);
    tooltip.html(`Node: ${d.data.name}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
})
.on("mouseout", function() {
    d3.select(this).select("circle").attr("fill", "#1a73e8");
    tooltip.transition().duration(500).style("opacity", 0);
});

// Title
svg.append("text")
    .attr("x", width / 2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    //.text("Education Tree");

// Text wrapping function
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // Slightly increased line height for better separation
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
})();