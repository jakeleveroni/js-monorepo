import { BoxGeometry, Vector3 } from "three";

// Temporary vector to avoid creating new instances for performance reasons
const _tempNormal = new Vector3();

/**
 * Computes the UV mapping for a given face direction and normal.
 * This function calculates the appropriate UV coordinate based on the geometry's rounded corners.
 *
 * @param {Vector3} faceDirVector - The direction of the face being processed
 * @param {Vector3} normal - The normal vector of the current vertex
 * @param {string} uvAxis - The axis used for UV mapping (e.g., 'x', 'y', or 'z')
 * @param {string} projectionAxis - The axis along which the projection is performed
 * @param {number} radius - The corner radius of the rounded box
 * @param {number} sideLength - The length of the current side of the box
 * @returns {number} - The computed UV coordinate
 */
function getUv(
	faceDirVector: Vector3,
	normal: Vector3,
	uvAxis: "x" | "y" | "z",
	projectionAxis: "x" | "y" | "z",
	radius: number,
	sideLength: number,
) {
	// Total arc length for a quarter-circle segment
	const totArcLength = (2 * Math.PI * radius) / 4;

	// Length of the flat part between rounded edges
	const centerLength = Math.max(sideLength - 2 * radius, 0);
	const halfArc = Math.PI / 4;

	// Project the normal onto the Y plane (ignoring the projectionAxis component)
	_tempNormal.copy(normal);
	_tempNormal[projectionAxis] = 0;
	_tempNormal.normalize();

	// Ratio of UV space allocated to the curved part
	const arcUvRatio = (0.5 * totArcLength) / (totArcLength + centerLength);

	// Determine how far along the arc the normal lies
	const arcAngleRatio = 1.0 - _tempNormal.angleTo(faceDirVector) / halfArc;

	if (Math.sign(_tempNormal[uvAxis]) === 1) {
		return arcAngleRatio * arcUvRatio;
	}

	// UV space allocated to the center plane
	const lenUv = centerLength / (totArcLength + centerLength);
	return lenUv + arcUvRatio + arcUvRatio * (1.0 - arcAngleRatio);
}

/**
 * A Three.js geometry class that creates a rounded box.
 *
 * This extends BoxGeometry and modifies it to include rounded corners.
 */
class RoundedBoxGeometry extends BoxGeometry {
	constructor(width = 1, height = 1, depth = 1, segments = 2, radius = 0.1) {
		// Ensure segments are odd to maintain a flat plane between rounded corners
		const _segments = segments * 2 + 1;

		// Prevent radius from exceeding the shortest side dimension
		const _radius = Math.min(width / 2, height / 2, depth / 2, radius);

		// Initialize the base BoxGeometry with additional segments for smoothness
		super(1, 1, 1, _segments, _segments, _segments);

		// If segments is 1, no rounding is needed, and we return early
		if (_segments === 1) return;

		// Convert to a non-indexed geometry for easier vertex manipulation
		const geometry2 = this.toNonIndexed();
		this.index = null;
		this.attributes.position = geometry2.attributes.position;
		this.attributes.normal = geometry2.attributes.normal;
		this.attributes.uv = geometry2.attributes.uv;

		// Create helper vectors
		const position = new Vector3();
		const normal = new Vector3();
		const faceDirVector = new Vector3();

		// Compute the inner box dimensions (excluding rounded corners)
		const box = new Vector3(width, height, depth)
			.divideScalar(2)
			.subScalar(_radius);

		// Get attribute arrays for direct manipulation
		const positions = this.attributes.position.array;
		const normals = this.attributes.normal.array;
		const uvs = this.attributes.uv.array;
		const faceTris = positions.length / 6;
		const halfSegmentSize = 0.5 / segments;

		// Iterate over each vertex to modify its position and normal
		for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) {
			// Read the current vertex position
			position.fromArray(positions, i);
			normal.copy(position);

			// Adjust normals to offset them slightly within the segment grid
			normal.x -= Math.sign(normal.x) * halfSegmentSize;
			normal.y -= Math.sign(normal.y) * halfSegmentSize;
			normal.z -= Math.sign(normal.z) * halfSegmentSize;
			normal.normalize();

			// Adjust vertex positions to form a smooth rounded shape
			positions[i + 0] = box.x * Math.sign(position.x) + normal.x * _radius;
			positions[i + 1] = box.y * Math.sign(position.y) + normal.y * _radius;
			positions[i + 2] = box.z * Math.sign(position.z) + normal.z * _radius;

			// Assign the updated normal values
			normals[i + 0] = normal.x;
			normals[i + 1] = normal.y;
			normals[i + 2] = normal.z;

			// Determine which face this vertex belongs to
			const side = Math.floor(i / faceTris);

			// Assign UV coordinates based on the face direction
			switch (side) {
				case 0: // right
					faceDirVector.set(1, 0, 0);
					uvs[j + 0] = getUv(faceDirVector, normal, "z", "y", _radius, depth);
					uvs[j + 1] =
						1.0 - getUv(faceDirVector, normal, "y", "z", _radius, height);
					break;

				case 1: // left
					faceDirVector.set(-1, 0, 0);
					uvs[j + 0] =
						1.0 - getUv(faceDirVector, normal, "z", "y", _radius, depth);
					uvs[j + 1] =
						1.0 - getUv(faceDirVector, normal, "y", "z", _radius, height);
					break;

				case 2: // top
					faceDirVector.set(0, 1, 0);
					uvs[j + 0] =
						1.0 - getUv(faceDirVector, normal, "x", "z", _radius, width);
					uvs[j + 1] = getUv(faceDirVector, normal, "z", "x", _radius, depth);
					break;

				case 3: // bottom
					// generate UVs along X then Z
					faceDirVector.set(0, -1, 0);
					uvs[j + 0] =
						1.0 - getUv(faceDirVector, normal, "x", "z", _radius, width);
					uvs[j + 1] =
						1.0 - getUv(faceDirVector, normal, "z", "x", _radius, depth);
					break;

				case 4: // front
					// generate UVs along X then Y
					faceDirVector.set(0, 0, 1);
					uvs[j + 0] =
						1.0 - getUv(faceDirVector, normal, "x", "y", _radius, width);
					uvs[j + 1] =
						1.0 - getUv(faceDirVector, normal, "y", "x", _radius, height);
					break;

				case 5: // back
					// generate UVs along X then Y
					faceDirVector.set(0, 0, -1);
					uvs[j + 0] = getUv(faceDirVector, normal, "x", "y", _radius, width);
					uvs[j + 1] =
						1.0 - getUv(faceDirVector, normal, "y", "x", _radius, height);
					break;
			}
		}
	}
}

export { RoundedBoxGeometry };
