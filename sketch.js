let grid;
let points = [];
let poly;
let canvas;
let dragged = false;

function setup() {
  canvas = createCanvas(1000, 800).elt;

  textAlign(CENTER, CENTER);

  const pad = 10;
  grid=new CoordSystem(0 + pad, 0 + pad, width - pad * 2, height - pad * 2)

  // p = new Point(0, 1);
  // grid.add(p);
  
  poly = new Polynomial([0]);
  grid.add(poly);

  // while (p.coeffs.length) {
    // grid.add(p);
    // poly = p.derivative();
  // }
}

function draw() {
  background(220);


  grid.display();
}

function mousePressed() {
  dragged = false;
}

function mouseReleased() {
  if (dragged) return;
  let [x, y] = grid.displayToCoord(mouseX, mouseY);
  let point = new Point(x, y);
  points.push(point);
  grid.add(point);

  poly.coeffs = lagrangeInterpolation(points)
}

function mouseDragged(evt) {
  console.log(evt.which)

  dragged = true;
  let [px, py] = grid.displayToCoord(pmouseX, pmouseY);
  let [cx, cy] = grid.displayToCoord(mouseX, mouseY);

  for (const p of points) {
    let [dx, dy] = grid.coordToDisplay(p.x, p.y);
    if (dist(dx, dy, pmouseX, pmouseY) < 15) {
      p.x = cx;
      p.y = cy;
      poly.coeffs = lagrangeInterpolation(points)
      return;
    }
  }
  grid.translate(px - cx, py - cy);
}

function mouseWheel(evt) {
  grid.scale(1 + evt.delta / 2000);
}

document.body.addEventListener("touchstart", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);
document.body.addEventListener("touchend", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);
document.body.addEventListener("touchmove", function (e) {
  if (e.target == canvas) {
    e.preventDefault();
  }
}, false);
