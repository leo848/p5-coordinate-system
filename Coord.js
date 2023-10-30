class CoordSystem {
  constructor(x, y, w, h) {
    this.objects = [];

    this.currentName = "A";
    this.colorIndex = 0;

    // Grid position: x, y, width, height.
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // Viewport: left, right, top, bottom.
    this.vl = -5 * this.w / 500;
    this.vr = 5 * this.w / 500;
    this.vt = 5 * this.h / 500;
    this.vb = -5 * this.h / 500;
  }

  display() {
    const { ceil, min, log10, abs, pow } = Math;

    // background rectangle
    fill(240);
    strokeWeight(2);
    stroke(180);
    rect(this.x, this.y, this.w, this.h, 5);

    // For every axis,
    for (const axis of ["x", "y"]) {
      // for every number from one to the other edge:
      const rawStart = axis === "x" ? this.vl : this.vb;
      const rawEnd = axis === "x" ? this.vr : this.vt;

      const stepArg = axis === "x" ? this.vr - this.vl : this.vt - this.vb;
      const step = calculateStep(stepArg / (axis === "x" ? this.w : this.h) * 500);
      const stepDigits = ceil(-min(0, log10(step)));
      const start = nextIntegerMultiple(rawStart, step);

      for (let uvar = start; uvar <= rawEnd; uvar+=step) {
        if (abs(uvar) < pow(10, -stepDigits - 1)) continue;

        let [x, y] = axis === "x" ? this.coordToDisplay(uvar, 0) : this.coordToDisplay(0, uvar);
        if (axis === "x") {
          y = clamp(y, this.y + 10, this.y + this.h - 10);
        } else {
          x = clamp(x, this.x + 10, this.x + this.w - 10);
        }

        // Draw the grid.
        strokeWeight(2);
        stroke(220);
        if (axis === "x") {
          line(x, this.y, x, this.y + this.h);
        } else {
          line(this.x, y, this.x + this.w, y);
        }
        strokeWeight(2);
        stroke(120);
        if (axis === "x") {
          line(x, y-10, x, y+10);
        } else {
          line(x-10, y, x+10, y);
        }
        noStroke();
        fill(100);
        textSize(20);
        let label = uvar.toFixed(stepDigits);
        if (axis === "x") {
          let textY = y - 20;
          if (textY < this.y + 10) textY = this.y + 40;
          text(label, x, textY);
        } else {
          let textX = x + 15 + textWidth(label) / 2;
          if (textX > this.x+this.w - 10) textX = this.x + this.w - 25 - textWidth(label) / 2;
          text(label, textX, y);
        }
      }

      strokeWeight(3);
      stroke(80);
      strokeCap(SQUARE);
      let [x, y] = this.coordToDisplay(0, 0);
      if (axis === "y") {
        x = clamp(x, this.x, this.x + this.w);
        line(x, this.y, x, this.y + this.h);
      } else {
        y = clamp(y, this.y, this.y + this.h);
        line(this.x, y, this.x+this.w, y);
      }
    }

    
    for (const obj of this.objects) {
      obj.display(this);
    }
  }
  
  point(ux, uy, name) {
    let [x, y] = this.coordToDisplay(ux, uy);
    if (name) {
      fill(20, 30, 200);
      stroke(40);
      strokeWeight(4);
      circle(x, y, 15);

      noStroke();
      fill(20);
      textSize(30);
      text(name, x + 20 * (x > this.x + this.w - 40 ? -1 : 1), y + 20 * (y < 40 ? 1 : -1));
    } else {
      fill(80);
      noStroke();
      circle(x, y, 10);
    }
  }

  line(ux1, uy1, ux2, uy2, col) {
    let [x1, y1] = this.coordToDisplay(ux1, uy1);
    let [x2, y2] = this.coordToDisplay(ux2, uy2);

    stroke(col);
    strokeWeight(4);
    line(x1, y1, x2, y2);
  }
  
  add(obj) {
    this.objects.push(obj);
  }

  translate(x, y) {
    this.vl += x;
    this.vr += x;
    this.vt += y;
    this.vb += y;
  }

  scale(factor) {
    factor -= 1
    let Δx = this.vr - this.vl;
    let Δy = this.vb - this.vt;

    this.vr += Δx * factor
    this.vl -= Δx * factor
    this.vb += Δy * factor
    this.vt -= Δy * factor
    // this.vr += factor
    // this.vl -= factor
    // this.vb += factor
    // this.vt -= factor
  }
  
  coordToDisplay(x, y) {
    return [map(x, this.vl, this.vr, this.x, this.x+this.w), map(y, this.vt, this.vb, this.y, this.y+this.h)];
  }

  displayToCoord(x, y) {
    return [map(x, this.x, this.x+this.w, this.vl, this.vr), map(y, this.y, this.y+this.h, this.vt, this.vb)];
  }

  getName() {
    let copy = this.currentName;
    this.currentName = (Number.parseInt(this.currentName, 36) + 1)
      .toString(36)
      .replace(/0|1/gi, 'A')
      .toUpperCase();
    return copy;
  }

  getColor() {
    const colors = [
      "#4c9aaf",
      "#07224e",
      "#d4d17f",
      "#c18d73",
      "#7d354d",
    ];
    return colors[this.colorIndex++ % colors.length];
  }
}

function calculateStep(width) {
  const smallerPowerOf10 = Math.pow(10, Math.floor(Math.log10(width)));
  const normalWidth = width / smallerPowerOf10;
  let ret;
  if (normalWidth <= 1.2) {
    ret = smallerPowerOf10;
  } else if (normalWidth < 2.5) {
    ret = smallerPowerOf10 * 2;
  } else if (normalWidth < 5.5) {
    ret = smallerPowerOf10 * 5;
  } else {
    ret = smallerPowerOf10 * 10;
  }
  return ret / 10;
}

function nextIntegerMultiple(base, num) {
  let multiple = base + num - 1;
  let rem = (multiple % num);
  if (rem < 0) rem += num;
  multiple -= rem;
  return multiple;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  display(grid) {
    if (!this.name) this.name = grid.getName();
    grid.point(this.x, this.y, this.name);
  }
}

class Polynomial {
  constructor(coeffs) {
    this.coeffs = coeffs;
    this.points = [];
  }

  display(grid) {
    if (!this.color) this.color = grid.getColor();

    this.points.length = 0;
    // if (this.points.length == 0) {
      let [l, r] = [grid.vl, grid.vr];
      let step = (r - l) / 50;

      for (let x = l; x <= r; x += step) {
        this.points.push({ x, y: this.eval(x) })
      }
    // }

    for (let i = 0; i < this.points.length - 1; i++) {
      grid.line(this.points[i].x, this.points[i].y, this.points[i+1].x, this.points[i+1].y, this.color);
    }
  }

  derivative() {
    return new Polynomial(this.coeffs.map((c,i) => c * i).slice(1));
  }

  eval(x) {
    const { pow } = Math;
    return this.coeffs.map((coeff, exponent) => coeff * pow(x, exponent)).reduce((a,b)=>a+b);
  }


}
