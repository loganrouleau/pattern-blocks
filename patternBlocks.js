const svgWidth = 1000;
const svgHeight = 800;
let svg = document.getElementById("svg");
let startx, starty, buttonClicked, selectedShapeId, dragx, dragy;
let shapeId = 1;

let shapes = {};

Object.keys(seedShapes).forEach((id) => createPolygon(id, "seed"));
drawOutline();
function drawOutline() {
  var el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  // el.setAttribute("id", `${shapeName}_${shapeNameSuffix}`);
  // el.style.fill = seedShape.colour;
  el.style.fill = "none";
  el.style.stroke = "black";
  for (value of levels.car.outline) {
    var point = svg.createSVGPoint();
    point.x = value[0] + 250;
    point.y = value[1];
    el.points.appendItem(point);
  }
  svg.appendChild(el);
}

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
  currentTransforms.appendItem(translateTransform); // 2. translate
  currentTransforms.appendItem(svg.createSVGTransform()); // 1. rotate
  svg.appendChild(el);
  return el;
}

let level1 = svg.getElementById("level_1");
level1.addEventListener("click", (e) => {
  e.stopImmediatePropagation();
  resetLevel(0);
});

svg.addEventListener("contextmenu", (e) => e.preventDefault());

svg.addEventListener("mousedown", (e) => {
  if (e.target.tagName === "polygon") {
    selectedShapeId = e.target.getAttribute("id");
    if (selectedShapeId.endsWith("seed")) {
      let shapeName = selectedShapeId.substring(0, selectedShapeId.length - 5);
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
    // if (e.target.getAttribute("id") === "level_1") {
    //   resetLevel();
    // }
    return;
  }

  if (buttonClicked === 2) {
    shapes[selectedShapeId].rotation += 3 * dragx;
  }
  if (buttonClicked === 0) {
    if (e.clientX > svgWidth - 150 && e.clientY > svgHeight - 150) {
      svg.removeChild(shapes[selectedShapeId].element);
      delete shapes[selectedShapeId];
    } else {
      shapes[selectedShapeId].offset[0] += dragx;
      shapes[selectedShapeId].offset[1] += dragy;
    }
  }
  dragx = 0;
  dragy = 0;
  selectedShapeId = undefined;
  if (detectHit()) {
    Object.values(shapes).forEach((shape) => {
      shape.element.style.fill = "black";
    });
  } else {
    Object.keys(shapes).forEach((shape) => {
      let colourKey = Object.keys(seedShapes).find((key) =>
        shape.startsWith(key)
      );
      shapes[shape].element.style.fill = seedShapes[colourKey].colour;
    });
  }
});

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
    let rotation = 3 * dragx + shapes[selectedShapeId].rotation;
    news.setMatrix(svg.createSVGMatrix().rotate(rotation));
    shapes[selectedShapeId].element.transform.baseVal.replaceItem(news, 1);
  }
});
function detectHit() {
  let hitFound = true;
  levels.car.requirements.forEach((req) => {
    const matchingShapes = Object.keys(shapes).filter((k) =>
      k.startsWith(req.shape)
    );
    if (matchingShapes.length === 0) {
      hitFound = false;
    }
    if (
      !matchingShapes.some((match) => {
        let newpoints = [];
        Object.values(shapes[match].element.points).forEach((point) => {
          let newPoint = svg.createSVGPoint();
          newPoint.x = point.x;
          newPoint.y = point.y;
          newPoint = newPoint.matrixTransform(shapes[match].element.getCTM());
          newpoints.push([newPoint.x, newPoint.y]);
        });
        return req.points.every((tp) => {
          let minDelta = Math.min(
            ...newpoints.map(
              (p) =>
                Math.pow(p[0] - (tp[0] + 250), 2) + Math.pow(p[1] - tp[1], 2)
            )
          );
          return minDelta < 225;
        });
      })
    ) {
      hitFound = false;
    }
  });
  return hitFound;
}

function resetLevel() {
  Object.values(shapes).forEach((shape) => svg.removeChild(shape.element));
  shapes = {};
}

function pointerWithinBounds(event) {
  return (
    event.clientX > 0 &&
    event.clientY > 0 &&
    event.clientX < svgWidth &&
    event.clientY < svgHeight
  );
}
