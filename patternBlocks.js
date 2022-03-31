let svg = document.getElementById("svg");
let startx, starty, buttonClicked, selectedShapeId, dragx, dragy;
let shapeId = 1;
let rightClickDragActivated = false;
const shapes = {};
const seedShapes = {
  triangle: {
    colour: "green",
    points: [
      [50, 0],
      [100, 86.6],
      [0, 86.6],
    ],
    offset: [120, 290],
  },
  square: {
    colour: "orange",
    points: [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ],
    offset: [20, 140],
  },
  hexagon: {
    colour: "yellow",
    points: [
      [50, 0],
      [150, 0],
      [200, 86.6],
      [150, 173.2],
      [50, 173.2],
      [0, 86.6],
    ],
    offset: [10, 10],
  },
  trapezoid: {
    colour: "red",
    points: [
      [50, 0],
      [150, 0],
      [200, 86.6],
      [0,86.6],
    ],
    offset: [10, 200],
  },
  parallelogram: {
    colour: "blue",
    points: [
      [50, 0],
      [150, 0],
      [100, 86.6],
      [0, 86.6],
    ],
    offset: [10, 290],
  },
  rhombus: {
    colour: "tan",
    points: [
      [0, 0],
      [100, 0],
      [186.6, 50],
      [86.6, 50],
    ],
    offset: [10, 400],
  },
};

Object.keys(seedShapes).forEach((id) => createPolygon(id, "seed"));

function createPolygon(shapeName, shapeNameSuffix) {
  seedShape = seedShapes[shapeName];
  var el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  el.setAttribute("id", `${shapeName}_${shapeNameSuffix}`);
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = "50% 50%";
  el.style.fill = seedShape.colour;
  el.style.stroke = "black";
  for (value of seedShape.points) {
    var point = svg.createSVGPoint();
    point.x = value[0];
    point.y = value[1];
    el.points.appendItem(point);
  }
  let currentTransforms = el.transform.baseVal;
  let translateTransform = svg.createSVGTransform();
  translateTransform.setTranslate(seedShape.offset[0], seedShape.offset[1]);
  currentTransforms.appendItem(translateTransform); // 3. translate
  currentTransforms.appendItem(svg.createSVGTransform()); // 2. flip
  currentTransforms.appendItem(svg.createSVGTransform()); // 1. rotate
  svg.appendChild(el);
  return el;
}

svg.addEventListener("contextmenu", (e) => e.preventDefault());

svg.addEventListener("mousedown", (e) => {
  console.log(shapes);
  console.log(seedShapes);
  if (e.target.tagName === "polygon") {
    selectedShapeId = e.target.getAttribute("id");
    if (selectedShapeId.endsWith("seed")) {
      let shapeName = selectedShapeId.substring(0, selectedShapeId.length - 5);
      console.log(shapeName);
      let newShape = {};
      newShape.points = seedShapes[shapeName].points;
      newShape.offset = JSON.parse(
        JSON.stringify(seedShapes[shapeName].offset)
      );
      newShape.element = createPolygon(shapeName, shapeId);
      newShape.flipped = false;
      newShape.rotation = 0;
      selectedShapeId = `${shapeName}_${shapeId}`;
      shapes[selectedShapeId] = newShape;
      shapeId++;
    }
    svg.appendChild(shapes[selectedShapeId].element);
    startx = e.clientX;
    starty = e.clientY;
    dragx = 0;
    dragy = 0;
    buttonClicked = e.button;
  }
});
svg.addEventListener("mouseup", (e) => {
  if (!selectedShapeId) {
    return;
  }

  if (buttonClicked === 2) {
    if (rightClickDragActivated) {
      shapes[selectedShapeId].rotation += 3 * dragx;
    } else {
      shapes[selectedShapeId].flipped = !shapes[selectedShapeId].flipped;
      let trans = svg.createSVGTransform();
      if (shapes[selectedShapeId].flipped) {
        trans.setMatrix(svg.createSVGMatrix().flipX());
      } else {
        trans.setMatrix(svg.createSVGMatrix());
      }
      shapes[selectedShapeId].element.transform.baseVal.replaceItem(trans, 1);
    }
  }
  if (buttonClicked === 0) {
    if (e.clientX > 600 && e.clientY > 400) {
      svg.removeChild(shapes[selectedShapeId].element);
      delete shapes[selectedShapeId];
    } else {
      shapes[selectedShapeId].offset[0] += dragx;
      shapes[selectedShapeId].offset[1] += dragy;
    }
  }
  dragx = 0;
  dragy = 0;
  rightClickDragActivated = false;
  selectedShapeId = undefined;
});
function pointerWithinBounds(event) {
  return (
    event.clientX > 0 &&
    event.clientY > 0 &&
    event.clientX < 700 &&
    event.clientY < 500
  );
}

svg.addEventListener("mousemove", (e) => {
  if (!selectedShapeId || !pointerWithinBounds(e)) {
    return;
  }
  dragx = e.clientX - startx;
  dragy = e.clientY - starty;
  let news = svg.createSVGTransform();
  if (buttonClicked === 0) {
    news.setMatrix(
      svg
        .createSVGMatrix()
        .translate(
          dragx + shapes[selectedShapeId].offset[0],
          dragy + shapes[selectedShapeId].offset[1]
        )
    );
    shapes[selectedShapeId].element.transform.baseVal.replaceItem(news, 0);
  } else {
    if (rightClickDragActivated) {
      let rotation = 3 * dragx + shapes[selectedShapeId].rotation;
      news.setMatrix(svg.createSVGMatrix().rotate(rotation));
      shapes[selectedShapeId].element.transform.baseVal.replaceItem(news, 2);
    } else if (dragx > 5 || dragx < -5) {
      rightClickDragActivated = true;
      startx = e.clientX;
    }
  }
  //   if (detectHit(shapes[selectedShapeId].element)) {
  //     shapes[selectedShapeId].element.style.fill = "red";
  //   } else {
  //   }
});
function detectHit(polygonElement) {
  let newpoints = [];
  Object.values(polygonElement.points).forEach((point) => {
    let newPoint = svg.createSVGPoint();
    newPoint.x = point.x;
    newPoint.y = point.y;
    newPoint = newPoint.matrixTransform(polygonElement.getCTM());
    newpoints.push([newPoint.x, newPoint.y]);
  });
  let hitFound = true;
  shapes[selectedShapeId].target.forEach((tp) => {
    let deltas = newpoints.map(
      (p) => Math.pow(p[0] - tp[0], 2) + Math.pow(p[1] - tp[1], 2)
    );
    if (Math.min(...deltas) > 225) {
      hitFound = false;
    }
  });
  return hitFound;
}
