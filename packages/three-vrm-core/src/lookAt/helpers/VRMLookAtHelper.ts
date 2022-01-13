import * as THREE from 'three';
import { VRMLookAt } from '../VRMLookAt';
import { FanBufferGeometry } from './utils/FanBufferGeometry';
import { LineAndSphereBufferGeometry } from './utils/LineAndSphereBufferGeometry';

const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();

const SQRT_2_OVER_2 = Math.sqrt(2.0) / 2.0;
const QUAT_XY_CW90 = new THREE.Quaternion(0, 0, -SQRT_2_OVER_2, SQRT_2_OVER_2);
const VEC3_POSITIVE_Y = new THREE.Vector3(0.0, 1.0, 0.0);

export class VRMLookAtHelper extends THREE.Group {
  public readonly vrmLookAt: VRMLookAt;
  private readonly _meshYaw: THREE.Mesh<FanBufferGeometry, THREE.MeshBasicMaterial>;
  private readonly _meshPitch: THREE.Mesh<FanBufferGeometry, THREE.MeshBasicMaterial>;
  private readonly _lineTarget: THREE.LineSegments<LineAndSphereBufferGeometry, THREE.LineBasicMaterial>;

  public constructor(lookAt: VRMLookAt) {
    super();
    this.matrixAutoUpdate = false;

    this.vrmLookAt = lookAt;

    {
      const geometry = new FanBufferGeometry();
      geometry.radius = 0.5;

      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });

      this._meshPitch = new THREE.Mesh(geometry, material);
      this.add(this._meshPitch);
    }

    {
      const geometry = new FanBufferGeometry();
      geometry.radius = 0.5;

      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });

      this._meshYaw = new THREE.Mesh(geometry, material);
      this.add(this._meshYaw);
    }

    {
      const geometry = new LineAndSphereBufferGeometry();
      geometry.radius = 0.1;

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        depthTest: false,
        depthWrite: false,
      });

      this._lineTarget = new THREE.LineSegments(geometry, material);
      this._lineTarget.frustumCulled = false;
      this.add(this._lineTarget);
    }
  }

  public dispose(): void {
    this._meshYaw.geometry.dispose();
    this._meshYaw.material.dispose();

    this._meshPitch.geometry.dispose();
    this._meshPitch.material.dispose();

    this._lineTarget.geometry.dispose();
    this._lineTarget.material.dispose();
  }

  public updateMatrixWorld(force: boolean): void {
    this.vrmLookAt.getLookAtWorldPosition(_v3A);
    this.vrmLookAt.getLookAtWorldQuaternion(_quatA);

    const yaw = this.vrmLookAt.euler.y;
    const pitch = this.vrmLookAt.euler.x;

    this._meshYaw.geometry.theta = yaw;
    this._meshYaw.geometry.update();
    this._meshYaw.position.copy(_v3A);
    this._meshYaw.quaternion.copy(_quatA);

    this._meshPitch.geometry.theta = pitch;
    this._meshPitch.geometry.update();
    this._meshPitch.position.copy(_v3A);
    this._meshPitch.quaternion.copy(_quatA);
    this._meshPitch.quaternion.multiply(_quatB.setFromAxisAngle(VEC3_POSITIVE_Y, yaw));
    this._meshPitch.quaternion.multiply(QUAT_XY_CW90);

    const target = this.vrmLookAt.target;
    if (target != null) {
      target.getWorldPosition(_v3B).sub(_v3A);
      this._lineTarget.geometry.tail.copy(_v3B);
      this._lineTarget.geometry.update();
      this._lineTarget.position.copy(_v3A);
    }

    super.updateMatrixWorld(force);
  }
}
