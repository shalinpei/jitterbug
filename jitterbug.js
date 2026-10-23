// Geometry for the classic 8-triangle jitterbug.
// Pure math: no Three.js and no drawing code. Everything here works with
// plain [x, y, z] arrays so it can be reasoned about (and tested) on its own.
//
// How it works:
// Each triangle sits in one octant of 3D space (one per sign combination
// of x, y, z). Each of its three corners lies on one of the coordinate
// planes (x = 0, y = 0, or z = 0), and is shared with the neighbouring
// triangle on the other side of that plane. For the triangle in the
// (+, +, +) octant the corners are:
//
//   (p, q, 0)   (0, p, q)   (q, 0, p)
//
// Changing the ratio of p to q twists the triangle and moves it in or out:
//   p = q        -> cuboctahedron (fully open)
//   q / p = phi  -> icosahedron   (phi = golden ratio)
//   p = 0        -> octahedron    (fully collapsed; corners merge in pairs)
//
// We write p = R·cos(b) and q = R·sin(b). The angle b sweeps from 45° to 90°,
// and R is chosen so the edge length never changes: the triangles stay rigid.

const SIGNS = [-1, 1];
const PHI = (1 + Math.sqrt(5)) / 2;

const B_OPEN = Math.PI / 4;
const B_COLLAPSED = Math.PI / 2;

// Slider position (0..1) at which the frame passes through an icosahedron.
export const ICOSAHEDRON_T = (Math.atan(PHI) - B_OPEN) / (B_COLLAPSED - B_OPEN);

// Build the vertex index for each shared corner, plus the 8 faces.
// Corners are keyed by the plane they sit on and the two signs that apply.
const cornerKeys = [];
const cornerIndex = new Map();

function corner(plane, s1, s2) {
  const key = `${plane}${s1}${s2}`;
  if (!cornerIndex.has(key)) {
    cornerIndex.set(key, cornerKeys.length);
    cornerKeys.push({ plane, s1, s2 });
  }
  return cornerIndex.get(key);
}

// FACES[i] is a list of 3 vertex indices.
export const FACES = [];
for (const sx of SIGNS) {
  for (const sy of SIGNS) {
    for (const sz of SIGNS) {
      FACES.push([corner('z', sx, sy), corner('x', sy, sz), corner('y', sx, sz)]);
    }
  }
}

// EDGES lists each strut once as a pair of vertex indices.
// Every triangle has its own 3 struts (24 total); neighbours meet only at joints.
export const EDGES = FACES.flatMap(([a, b, c]) => [[a, b], [b, c], [c, a]]);

// Vertex positions for slider position t (0 = open, 1 = collapsed).
export function getVertices(t, edgeLength = 1) {
  const b = B_OPEN + (B_COLLAPSED - B_OPEN) * t;
  // Edge length² = 2·(p² − pq + q²) = R²·(2 − sin 2b), so solve for R.
  const r = edgeLength / Math.sqrt(2 - Math.sin(2 * b));
  const p = r * Math.cos(b);
  const q = r * Math.sin(b);

  return cornerKeys.map(({ plane, s1, s2 }) => {
    if (plane === 'z') return [s1 * p, s2 * q, 0]; // signs: x, y
    if (plane === 'x') return [0, s1 * p, s2 * q]; // signs: y, z
    return [s1 * q, 0, s2 * p];                     // signs: x, z
  });
}

// A readable name for the shape at slider position t.
export function shapeName(t) {
  const near = 0.02;
  if (t <= near) return 'Cuboctahedron';
  if (Math.abs(t - ICOSAHEDRON_T) <= near) return 'Icosahedron';
  if (t >= 1 - near) return 'Octahedron';
  return 'Twisting…';
}
