// tree.js
(function () {
  // ================================================
  // 1. DATA
  // ================================================
  const educationData = {
    "name": "Drawing",
    "children": [
      {
        "name": "Interests",
        "children": [
          { "name": "2018–2020: Local Art School - Beginner Drawing Classes" },
          { "name": "2021: Summer Workshop - Digital Illustration Techniques" },
          { "name": "2022–Present: Mentorship with Local Artist" }
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
        "name": "Favorites",
        "children": [
          { "name": "Anime Style" },
          { "name": "Realism" }
        ]
      },
      {
        "name": "Achievements",
        "children": [
          { "name": "Art Competition Entries" }
        ]
      },
      {
        "name": "Daily Practice",
        "children": [
          { "name": "1–2 hours daily" }
        ]
      }
    ]
  };

  // ================================================
  // 2. LAYOUT & DIMENSIONS
  // ================================================
  const margin = { top: 60, right: 300, bottom: 40, left: 80 };
  const treeLayout = d3.tree().nodeSize([70, 280]);
  const root = d3.hierarchy(educationData);
  treeLayout(root);

  const descendants = root.descendants();
  const maxDepth = root.height;
  const totalNodes = descendants.length;
  const minWidth = totalNodes * 280 + margin.left + margin.right;
  const minHeight = (maxDepth + 1) * 70 + margin.top + margin.bottom;

  const width = Math.min(minWidth, window.innerWidth * 0.9);
  const height = Math.min(minHeight, 1200);

  // ================================================
  // 3. SVG + ZOOM + GRADIENTS
  // ================================================
  const svg = d3.select("#vis-three")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .style("background", "#fafafa");

  // Define gradients
  const defs = svg.append("defs");

  const rainbowGradient = defs.append("linearGradient")
    .attr("id", "rainbow-gradient")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "100%");
  rainbowGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FF6B6B");
  rainbowGradient.append("stop").attr("offset", "25%").attr("stop-color", "#FFD93D");
  rainbowGradient.append("stop").attr("offset", "50%").attr("stop-color", "#4ECDC4");
  rainbowGradient.append("stop").attr("offset", "75%").attr("stop-color", "#1E90FF");
  rainbowGradient.append("stop").attr("offset", "100%").attr("stop-color", "#9370DB");

  const sunGradient = defs.append("radialGradient")
    .attr("id", "sun-gradient");
  sunGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FFD700");
  sunGradient.append("stop").attr("offset", "100%").attr("stop-color", "#FFA500");

  const hoverGradient = defs.append("radialGradient")
    .attr("id", "hover-gradient");
  hoverGradient.append("stop").attr("offset", "0%").attr("stop-color", "#FF6B6B");
  hoverGradient.append("stop").attr("offset", "100%").attr("stop-color", "#FF4500");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const zoom = d3.zoom()
    .scaleExtent([0.3, 3])
    .on("zoom", (event) => g.attr("transform", event.transform));

  svg.call(zoom);

  // Fit tree on load
  const treeBounds = {
    x0: d3.min(descendants, d => d.x) - 50,
    x1: d3.max(descendants, d => d.x) + 50,
    y0: d3.min(descendants, d => d.y) - 50,
    y1: d3.max(descendants, d => d.y) + 50
  };

  const fullWidth = treeBounds.y1 - treeBounds.y0;
  const fullHeight = treeBounds.x1 - treeBounds.x0;
  const scale = Math.min(width / fullWidth, height / fullHeight) * 0.9;

  const initialTransform = d3.zoomIdentity
    .translate(width / 2, height / 2)
    .scale(scale)
    .translate(-(treeBounds.y0 + treeBounds.y1) / 2, -(treeBounds.x0 + treeBounds.x1) / 2);

  svg.call(zoom.transform, initialTransform);

  // ================================================
  // 4. LINKS
  // ================================================
  g.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));

  // ================================================
  // 5. NODES
  // ================================================
  const nodes = g.selectAll(".node")
    .data(descendants)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.y},${d.x})`)
    .style("cursor", "pointer");

  nodes.append("circle")
    .attr("r", 7);

  nodes.append("text")
    .attr("dy", "0.35em")
    .attr("x", d => d.children ? -18 : 18)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .text(d => d.data.name)
    .call(wrap, 260);

  // ================================================
  // 6. TOOLTIP
  // ================================================
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  nodes.on("mouseover", function (event, d) {
    d3.select(this).select("circle")
      .transition().duration(150)
      .attr("r", 18)
      .attr("fill", "url(#hover-gradient)");

    tooltip.transition().duration(200).style("opacity", 1);
    tooltip.html(`<strong>${d.data.name}</strong>`)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 15) + "px");
  })
  .on("mouseout", function () {
    d3.select(this).select("circle")
      .transition().duration(200)
      .attr("r", 7)
      .attr("fill", "url(#sun-gradient)");

    tooltip.transition().duration(400).style("opacity", 0);
  });

  // ================================================
  // 7. TITLE
  // ================================================
  svg.append("text")
    .attr("x", (width + margin.left + margin.right) / 2)
    .attr("y", 35)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .style("font-weight", "bold")
    .style("fill", "#2c3e50")
    .style("font-family", "'Fredoka One', cursive")
    .text("Your Art Journey");

  // ================================================
  // 8. TEXT WRAP
  // ================================================
  function wrap(text, width) {
    text.each(function () {
      const text = d3.select(this);
      const words = text.text().split(/\s+/).reverse();
      let word;
      let line = [];
      let lineNumber = 0;
      const lineHeight = 1.2;
      const y = text.attr("y") || 0;
      const dy = parseFloat(text.attr("dy"));
      let tspan = text.text(null)
        .append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", ++lineNumber * lineHeight + dy + "em")
            .text(word);
        }
      }
    });
  }

  // ================================================
  // 9. RESIZE
  // ================================================
  window.addEventListener("resize", () => {
    const newWidth = Math.min(window.innerWidth * 0.9, minWidth);
    svg.attr("width", newWidth + margin.left + margin.right);
  });

})();