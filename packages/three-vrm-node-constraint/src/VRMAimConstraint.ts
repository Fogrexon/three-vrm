import * as THREE from 'three';
import { decomposePosition } from './utils/decomposePosition';
import { decomposeRotation } from './utils/decomposeRotation';
import { quatInvertCompat } from './utils/quatInvertCompat';
import { setAimQuaternion } from './utils/setAimQuaternion';
import { VRMNodeConstraint } from './VRMNodeConstraint';

const QUAT_IDENTITY = new THREE.Quaternion(0, 0, 0, 1);

const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _matA = new THREE.Matrix4();
const _v3GetRotationPos = new THREE.Vector3();
const _v3GetRotationDir = new THREE.Vector3();

export class VRMAimConstraint extends VRMNodeConstraint {
  /**
   * Represents the aim vector used for reference of aim rotation.
   * It must be normalized.
   */
  public readonly aimVector = new THREE.Vector3(0.0, 0.0, 1.0);

  /**
   * Represents the up vector used for calculation of aim rotation.
   * It must be normalized.
   */
  public readonly upVector = new THREE.Vector3(0.0, 1.0, 0.0);

  public freezeAxes: [boolean, boolean] = [true, true];

  private readonly _quatInitAim = new THREE.Quaternion();
  private readonly _quatInvInitAim = new THREE.Quaternion();
  private readonly _quatInitDst = new THREE.Quaternion();

  public setInitState(): void {
    this._getDestinationMatrix(_matA);
    decomposeRotation(_matA, this._quatInitDst);

    this._getAimQuat(this._quatInitAim);
    quatInvertCompat(this._quatInvInitAim.copy(this._quatInitAim));
  }

  public update(): void {
    if (this.destinationSpace === 'local') {
      // reset rotation
      this.object.quaternion.copy(QUAT_IDENTITY);
    } else {
      // back to the initial rotation in world space
      this._getParentMatrixInModelSpace(_matA);
      decomposeRotation(_matA, _quatA);
      quatInvertCompat(this.object.quaternion.copy(_quatA));
    }

    // aim toward the target
    this._getAimDiffQuat(_quatB);
    this.object.quaternion.multiply(_quatB);

    // apply the initial rotation
    this.object.quaternion.multiply(this._quatInitDst);

    // done
    this.object.updateMatrix();
  }

  /**
   * Return a quaternion that represents a diff from the initial -> current orientation of the aim direction.
   * It's aware of its {@link sourceSpace}, {@link freezeAxes}, and {@link weight}.
   * @param target Target quaternion
   */
  private _getAimDiffQuat<T extends THREE.Quaternion>(target: T): T {
    this._getAimQuat(target);
    target.multiply(this._quatInvInitAim);

    target.slerp(QUAT_IDENTITY, 1.0 - this.weight);

    return target;
  }

  /**
   * Return a current orientation of the aim direction.
   * It's aware of its {@link sourceSpace} and {@link freezeAxes}.
   * @param target Target quaternion
   */
  private _getAimQuat<T extends THREE.Quaternion>(target: T): T {
    return setAimQuaternion(
      target,
      this._getDestinationPosition(_v3GetRotationPos),
      this._getSourcePosition(_v3GetRotationDir),
      this.aimVector,
      this.upVector,
      this.freezeAxes,
    );
  }

  /**
   * Return the current position of the object.
   * It's aware of its {@link sourceSpace}.
   * @param target Target quaternion
   */
  private _getDestinationPosition<T extends THREE.Vector3>(target: T): T {
    target.set(0.0, 0.0, 0.0);

    this._getDestinationMatrix(_matA);
    decomposePosition(_matA, target);

    return target;
  }

  /**
   * Return the current position of the source.
   * It's aware of its {@link sourceSpace}.
   * @param target Target quaternion
   */
  private _getSourcePosition<T extends THREE.Vector3>(target: T): T {
    target.set(0.0, 0.0, 0.0);

    if (this._source) {
      this._getSourceMatrix(_matA);
      decomposePosition(_matA, target);
    }

    return target;
  }
}
