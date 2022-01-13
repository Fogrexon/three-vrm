import * as THREE from 'three';

export function vector3FreezeAxes<T extends THREE.Vector3>(target: T, freeze: [boolean, boolean, boolean]): T {
  if (freeze[0] && freeze[1] && freeze[2]) {
    return target;
  }
  if (!freeze[0] && !freeze[1] && !freeze[2]) {
    return target.set(0.0, 0.0, 0.0);
  }

  if (!freeze[0]) {
    target.x *= 0.0;
  }
  if (!freeze[1]) {
    target.y *= 0.0;
  }
  if (!freeze[2]) {
    target.z *= 0.0;
  }
  return target;
}
