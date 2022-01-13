import type { ConstraintObjectSpace } from './ConstraintObjectSpace';

/**
 * A constraint that links the rotation with sources.
 */
export interface RotationConstraint {
  /**
   * The index of the node constrains the node.
   */
  source: number;

  /**
   * The source node will be evaluated in this space.
   */
  sourceSpace?: ConstraintObjectSpace;

  /**
   * The destination node will be evaluated in this space.
   */
  destinationSpace?: ConstraintObjectSpace;

  /**
   * Axes be constrained by this constraint, in X-Y-Z order.
   */
  freezeAxes?: [boolean, boolean, boolean];

  /**
   * The weight of the constraint.
   */
  weight?: number;
}
