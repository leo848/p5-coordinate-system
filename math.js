function lagrangeInterpolation(points) {
  const n = points.length;
  if (n == 0) return [0];
  // if (n == 1) return [points[0].y];
  let coefficients = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let partPolynomial = [1];
    for (let j = 0; j < n; j++) {
      if (j == i) continue;
      partPolynomial = multiply(partPolynomial, [ -points[j].x, 1 ])
    }

    partPolynomial = partPolynomial.map(c=>c/evaluate(partPolynomial, points[i].x) * points[i].y)
    coefficients = add(coefficients, partPolynomial);
  }

  return coefficients;
}

function multiply(poly1, poly2) {
    const result = Array(poly1.length + poly2.length - 1).fill(0);

    for (let i = 0; i < poly1.length; i++) {
        for (let j = 0; j < poly2.length; j++) {
            result[i + j] += poly1[i] * poly2[j];
        }
    }

    return result;
}

function add(poly1, poly2) {
  return poly1.map((c, i) => c + poly2[i]);
}

function evaluate(poly, x) {
  // return poly.map((c,i)=>c*Math.pow(x,i)).reduce((a,b)=>a+b) // Naive method
  let result = 0;
  for (let i = poly.length - 1; i >= 0; i--) {
    result = result * x + poly[i]; // Horner's method
  }
  return result;
}

function clamp(num, start, end) {
  if (num < start) return start;
  if (num > end) return end;
  return num;
}

function evaluateDerivative(coefficients, x) {
    let result = 0;
    for (let i = 1; i < coefficients.length; i++) {
        result += i * coefficients[i] * Math.pow(x, i - 1);
    }
    return result;
}

function newtonRaphson(coefficients, initialGuess, tolerance) {
    let x0 = initialGuess;
    let x1;
    let fx0 = evaluate(coefficients, x0);
    let fpx0 = evaluateDerivative(coefficients, x0);
    
    while (Math.abs(fx0) > tolerance) {
        x1 = x0 - fx0 / fpx0;
        fx0 = evaluate(coefficients, x1);
        fpx0 = evaluateDerivative(coefficients, x1);
        
        if (Math.abs(evaluate(coefficients, x1)) < tolerance) {
            // Converged to a root within the given tolerance
            return x1;
        }
        
        x0 = x1;
    }
    
    return null; // No root found within the given tolerance
}
function findRoots(coefficients, initialGuess=0, tolerance=1e-5) {
    let roots = [];
    
    while (coefficients.length > 3) {
        let root = newtonRaphson(coefficients, initialGuess, tolerance);
        if (root !== null) {
            roots.push(root);
            // Update coefficients array based on the found root
            let newCoefficients = [coefficients[0]];
            for (let i = 1; i < coefficients.length - 1; i++) {
                newCoefficients.push(coefficients[i] + root * newCoefficients[i - 1]);
            }
            coefficients = newCoefficients;
        } else {
            // Unable to find a root, exit the loop
            break;
        }
    }
    
    // The remaining quadratic equation can be solved directly
    if (coefficients.length === 3) {
        let discriminant = coefficients[1] * coefficients[1] - 4 * coefficients[0] * coefficients[2];
        if (discriminant >= 0) {
            roots.push((-coefficients[1] + Math.sqrt(discriminant)) / (2 * coefficients[0]));
            roots.push((-coefficients[1] - Math.sqrt(discriminant)) / (2 * coefficients[0]));
        }
    } else if (coefficients.length === 2 && !roots.length) {
      roots.push(-coefficients[0] / coefficients[1]);
    }
    
    return roots;
}
