const svgWidth = 1000;
const svgHeight = 800;
let svg = document.getElementById("svg");
let startx,
  starty,
  dragx,
  dragy,
  currentRotation,
  buttonClicked,
  selectedBlockId;
let blockId = 1;
let shapeBoundingRect;
let blocks = {};

Object.keys(seedBlocks).forEach((id) => createPolygon(id, "seed"));
drawOutline();
function drawOutline() {
  var el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  // el.setAttribute("id", `${shapeName}_${shapeNameSuffix}`);
  // el.style.fill = seedShape.colour;
  el.setAttribute("id", "shape_outline");
  el.style.fill = "none";
  el.style.stroke = "black";
  shapes.penguin.outline.forEach((point) => (point[0] += 250));
  for (value of shapes.penguin.outline) {
    var point = svg.createSVGPoint();
    point.x = value[0];
    point.y = value[1];
    el.points.appendItem(point);
  }
  svg.appendChild(el);
  shapeBoundingRect = el.getBoundingClientRect();
}

function createPolygon(shapeName, shapeNameSuffix) {
  seedBlock = seedBlocks[shapeName];
  var el = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  el.setAttribute("id", `${shapeName}_${shapeNameSuffix}`);
  el.style.transformBox = "fill-box";
  el.style.transformOrigin = shapeName === "triangle" ? "50% 57.7%" : "50% 50%";
  el.style.fill = seedBlock.colour;
  el.style.stroke = "black";
  for (value of seedBlock.points) {
    var point = svg.createSVGPoint();
    point.x = value[0];
    point.y = value[1];
    el.points.appendItem(point);
  }
  let currentTransforms = el.transform.baseVal;
  let translateTransform = svg.createSVGTransform();
  translateTransform.setTranslate(seedBlock.offset[0], seedBlock.offset[1]);
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
    selectedBlockId = e.target.getAttribute("id");
    if (selectedBlockId.endsWith("seed")) {
      let blockName = selectedBlockId.substring(0, selectedBlockId.length - 5);
      let newBlock = {};
      newBlock.points = seedBlocks[blockName].points;
      newBlock.offset = JSON.parse(
        JSON.stringify(seedBlocks[blockName].offset)
      );
      newBlock.element = createPolygon(blockName, blockId);
      newBlock.flipped = false;
      newBlock.rotation = 0;
      selectedBlockId = `${blockName}_${blockId}`;
      blocks[selectedBlockId] = newBlock;
      blockId++;
    }
    svg.appendChild(blocks[selectedBlockId].element);
    startx = e.clientX;
    starty = e.clientY;
    dragx = 0;
    dragy = 0;
    currentRotation = 0;
    buttonClicked = e.button;
  }
});

svg.addEventListener("mouseup", (e) => {
  if (!selectedBlockId) {
    return;
  }

  if (buttonClicked === 2) {
    blocks[selectedBlockId].rotation =
      (blocks[selectedBlockId].rotation + currentRotation) % 360;
  }
  if (buttonClicked === 0) {
    if (e.clientX > svgWidth - 150 && e.clientY > svgHeight - 150) {
      svg.removeChild(blocks[selectedBlockId].element);
      delete blocks[selectedBlockId];
    } else {
      blocks[selectedBlockId].offset[0] += dragx;
      blocks[selectedBlockId].offset[1] += dragy;
    }
  }
  dragx = 0;
  dragy = 0;
  selectedBlockId = undefined;
  if (detectHit()) {
    Object.values(blocks).forEach((shape) => {
      shape.element.style.fill = "black";
    });
  } else {
    Object.keys(blocks).forEach((shape) => {
      let colourKey = Object.keys(seedBlocks).find((key) =>
        shape.startsWith(key)
      );
      blocks[shape].element.style.fill = seedBlocks[colourKey].colour;
    });
  }
});

svg.addEventListener("mousemove", (e) => {
  if (!selectedBlockId || !pointerWithinBounds(e)) {
    return;
  }
  dragx = e.clientX - startx;
  dragy = e.clientY - starty;
  let news = svg.createSVGTransform();
  if (buttonClicked === 0) {
    // translate
    news.setMatrix(
      svg
        .createSVGMatrix()
        .translate(
          dragx + blocks[selectedBlockId].offset[0],
          dragy + blocks[selectedBlockId].offset[1]
        )
    );
    blocks[selectedBlockId].element.transform.baseVal.replaceItem(news, 0);
  } else {
    // rotate
    if (dragx > 5 || dragx < -5) {
      startx = e.clientX;
      currentRotation += dragx > 0 ? 30 : -30;
      news.setMatrix(
        svg
          .createSVGMatrix()
          .rotate(currentRotation + blocks[selectedBlockId].rotation)
      );
      blocks[selectedBlockId].element.transform.baseVal.replaceItem(news, 1);
    }
  }
});

function detectHit() {
  let percentOfShapeCoveredExactlyOnce = percentOfShapeCoveredOnce();
  console.log(percentOfShapeCoveredExactlyOnce);
  return percentOfShapeCoveredExactlyOnce > 95;
}

function getTransformedCoordinates(block) {
  let newPoints = [];
  const ctm = block.element.getCTM();
  Object.values(block.element.points).forEach((point) => {
    let transformedPoint = svg.createSVGPoint();
    transformedPoint.x = point.x;
    transformedPoint.y = point.y;
    transformedPoint = transformedPoint.matrixTransform(ctm);
    newPoints.push([transformedPoint.x, transformedPoint.y]);
  });
  return newPoints;
}

function percentOfShapeCoveredOnce() {
  let shapePoints = [];
  let pointsCoveredOnce = 0;
  for (let x = shapeBoundingRect.left; x <= shapeBoundingRect.right; x += 5) {
    for (let y = shapeBoundingRect.top; y <= shapeBoundingRect.bottom; y += 5) {
      if (isPointInFill(x, y, shapes.penguin.outline)) {
        shapePoints.push([x, y]);
      }
    }
  }
  shapePoints.forEach((point) => {
    let covered = 0;
    for (const key of Object.keys(blocks)) {
      let coords = getTransformedCoordinates(blocks[key]);
      if (isPointInFill(point[0], point[1], coords)) {
        covered++;
        if (covered > 1) {
          break;
        }
      }
    }
    if (covered === 1) {
      pointsCoveredOnce++;
    }
  });
  return 100 * (pointsCoveredOnce / shapePoints.length);
}

function isPointInFill(x, y, polyPoints) {
  // ray tracing algorithm (horizontal ray heading in positive x direction)
  let rayIntersectionsWithPolyEdge = 0;
  for (let i = 0; i < polyPoints.length; i++) {
    let polyPoint1 = polyPoints[i];
    let polyPoint2 = polyPoints[i + 1 === polyPoints.length ? 0 : i + 1];
    if (
      (polyPoint1[0] < x && polyPoint2[0] < x) ||
      (polyPoint1[1] > y && polyPoint2[1] > y) ||
      (polyPoint1[1] < y && polyPoint2[1] < y)
    ) {
      continue;
    }
    let slope =
      (polyPoint2[1] - polyPoint1[1]) / (polyPoint2[0] - polyPoint1[0]);
    let xIntercept = (1 / slope) * (y - polyPoint1[1]) + polyPoint1[0];
    if (xIntercept >= x) {
      rayIntersectionsWithPolyEdge++;
    }
  }
  return rayIntersectionsWithPolyEdge % 2 === 1;
}

function resetLevel() {
  Object.values(blocks).forEach((shape) => svg.removeChild(shape.element));
  blocks = {};
}

function pointerWithinBounds(event) {
  return (
    event.clientX > 0 &&
    event.clientY > 0 &&
    event.clientX < svgWidth &&
    event.clientY < svgHeight
  );
}
