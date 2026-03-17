class Vec3 {
    constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
    add(v) { return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z); }
    sub(v) { return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z); }
    mul(s) { return new Vec3(this.x * s, this.y * s, this.z * s); }
    dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
    length() { return Math.sqrt(this.dot(this)); }
    unit() { return this.mul(1 / this.length()); }
}

class Ray {
    constructor(origin, direction) {
        this.origin = origin;
        this.direction = direction.unit();
    }
    at(t) { return this.origin.add(this.direction.mul(t)); }
}

// the scence objects
class Sphere {
    constructor(center, radius, color, shininess, reflectivity = 0) {
        this.center = center;
        this.radius = radius;
        this.color = color; 
        this.shininess = shininess;
        this.reflectivity = reflectivity; // Innovation component
    }

    intersect(ray) {
        const oc = ray.origin.sub(this.center);
        const a = ray.direction.dot(ray.direction);
        const b = 2.0 * oc.dot(ray.direction);
        const c = oc.dot(oc) - this.radius * this.radius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return null;
        return (-b - Math.sqrt(discriminant)) / (2.0 * a);
    }
}

// --- the lighting engine 
const lightPos = new Vec3(5, 5, 5);
const ambientIntensity = 0.2;

function trace(ray, scene, depth) {
    if (depth <= 0) return new Vec3(0, 0, 0);

    let closestT = Infinity;
    let hitObj = null;

    for (const obj of scene) {
        const t = obj.intersect(ray);
        if (t > 0.001 && t < closestT) {
            closestT = t;
            hitObj = obj;
        }
    }

    if (hitObj) {
        const hitPoint = ray.at(closestT);
        const normal = hitPoint.sub(hitObj.center).unit();
        const lightDir = lightPos.sub(hitPoint).unit();
        const viewDir = ray.direction.mul(-1).unit();
        
        // shadow cmputation
        const shadowRay = new Ray(hitPoint.add(normal.mul(0.001)), lightDir);
        let inShadow = false;
        for (const obj of scene) {
            if (obj.intersect(shadowRay) > 0) { inShadow = true; break; }
        }

        let color = hitObj.color.mul(ambientIntensity); // ambience 

        if (!inShadow) {
            const diff = Math.max(normal.dot(lightDir), 0); // diffusion
            color = color.add(hitObj.color.mul(diff));

            const reflectDir = normal.mul(2 * normal.dot(lightDir)).sub(lightDir).unit();
            const spec = Math.pow(Math.max(viewDir.dot(reflectDir), 0), hitObj.shininess); // specs
            color = color.add(new Vec3(1, 1, 1).mul(spec));
        }

        // recurring reflection 
        if (hitObj.reflectivity > 0) {
            const reflectedRay = new Ray(hitPoint.add(normal.mul(0.001)), ray.direction.sub(normal.mul(2 * ray.direction.dot(normal))));
            const reflectedColor = trace(reflectedRay, scene, depth - 1);
            color = color.mul(1 - hitObj.reflectivity).add(reflectedColor.mul(hitObj.reflectivity));
        }
        return color;
    }

    // gradiant backgrounds 
    const t = 0.5 * (ray.direction.y + 1.0);
    return new Vec3(1.0, 1.0, 1.0).mul(1.0 - t).add(new Vec3(0.5, 0.7, 1.0).mul(t));
}

// render triggers
function render() {
    const canvas = document.getElementById('renderCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.createImageData(width, height);
    
    const scene = [
        new Sphere(new Vec3(0, -100.5, -1), 100, new Vec3(0.5, 0.5, 0.5), 10), // floors
        new Sphere(new Vec3(0, 0, -1.2), 0.5, new Vec3(0.1, 0.2, 0.8), 50, 0.2), // blue
        new Sphere(new Vec3(-1.1, 0, -1), 0.5, new Vec3(0.8, 0.1, 0.1), 100, 0.1), // red
        new Sphere(new Vec3(1.1, 0, -1), 0.5, new Vec3(0.9, 0.9, 0.9), 200, 0.6) // miror
    ];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const u = x / width;
            const v = (height - y) / height;
            const dir = new Vec3(4 * u - 2, 2.25 * v - 1.125, -1);
            const ray = new Ray(new Vec3(0, 0, 0), dir);
            const pixelColor = trace(ray, scene, 3);
            
            const i = (y * width + x) * 4;
            imageData.data[i] = pixelColor.x * 255;
            imageData.data[i + 1] = pixelColor.y * 255;
            imageData.data[i + 2] = pixelColor.z * 255;
            imageData.data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    document.getElementById('status').innerText = "Render Complete!";
}