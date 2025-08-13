'use client';

import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';

class Vector2D {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static random(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

class Vector3D {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static random(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

class AnimationController {
  private timeline: gsap.core.Timeline;
  private time = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number;
  private size: number;
  private stars: Star[] = [];

  private readonly changeEventTime = 0; // immediate scatter
  private readonly cameraZ = -400;
  private readonly cameraTravelDistance = 3400;
  private readonly startDotYOffset = 28;
  private readonly viewZoom = 100;
  private readonly numberOfStars = 3000;
  private readonly trailLength = 0; // remove spiraling trail completely

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    dpr: number,
    size: number
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.dpr = dpr;
    this.size = size;
    this.timeline = gsap.timeline({ repeat: -1 });
    this.setupRandomGenerator();
    this.createStars();
    this.setupTimeline();
  }

  private setupRandomGenerator() {
    const originalRandom = Math.random;
    const customRandom = () => {
      let seed = 1234;
      return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
    };

    Math.random = customRandom();
    this.createStars();
    Math.random = originalRandom;
  }

  private createStars() {
    for (let i = 0; i < this.numberOfStars; i++) {
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance));
    }
  }

  private setupTimeline() {
    // Play forward then reverse to create a seamless loop of scatter-in/out
    this.timeline.to(this, {
      time: 1,
      duration: 8,
      ease: 'none',
      onUpdate: () => this.render(),
    });
    this.timeline.to(this, {
      time: 0,
      duration: 8,
      ease: 'none',
      onUpdate: () => this.render(),
    });
    this.timeline.repeat(-1);
  }

  ease(p: number, g: number): number {
    if (p < 0.5) {
      return 0.5 * (2 * p) ** g;
    }
    return 1 - 0.5 * (2 * (1 - p)) ** g;
  }

  easeOutElastic(x: number): number {
    const c4 = (2 * Math.PI) / 4.5;
    if (x <= 0) {
      return 0;
    }
    if (x >= 1) {
      return 1;
    }
    return 2 ** (-8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1;
  }

  map(
    value: number,
    start1: number,
    stop1: number,
    start2: number,
    stop2: number
  ): number {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  }

  constrain(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  lerp(start: number, end: number, t: number): number {
    return start * (1 - t) + end * t;
  }

  spiralPath(p: number): Vector2D {
    const constrained = this.constrain(1.2 * p, 0, 1);
    const eased = this.ease(constrained, 1.8);
    const numberOfSpiralTurns = 6;
    const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(eased);
    const r = 170 * Math.sqrt(eased);

    return new Vector2D(
      r * Math.cos(theta),
      r * Math.sin(theta) + this.startDotYOffset
    );
  }

  rotate(
    v1: Vector2D,
    v2: Vector2D,
    p: number,
    orientation: boolean
  ): Vector2D {
    const middle = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2);

    const dx = v1.x - middle.x;
    const dy = v1.y - middle.y;
    const angle = Math.atan2(dy, dx);
    const o = orientation ? -1 : 1;
    const r = Math.sqrt(dx * dx + dy * dy);

    const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p);

    return new Vector2D(
      middle.x +
        r *
          (1 + bounce) *
          Math.cos(angle + o * Math.PI * this.easeOutElastic(p)),
      middle.y +
        r *
          (1 + bounce) *
          Math.sin(angle + o * Math.PI * this.easeOutElastic(p))
    );
  }

  showProjectedDot(position: Vector3D, sizeFactor: number) {
    const t2 = this.constrain(
      this.map(this.time, this.changeEventTime, 1, 0, 1),
      0,
      1
    );
    const newCameraZ =
      this.cameraZ + this.ease(t2 ** 1.2, 1.8) * this.cameraTravelDistance;

    if (position.z > newCameraZ) {
      const dotDepthFromCamera = position.z - newCameraZ;

      const x = (this.viewZoom * position.x) / dotDepthFromCamera;
      const y = (this.viewZoom * position.y) / dotDepthFromCamera;
      const sw = (400 * sizeFactor) / dotDepthFromCamera;

      this.ctx.lineWidth = sw;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 0.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawStartDot() {
    if (this.time > this.changeEventTime) {
      const dy = (this.cameraZ * this.startDotYOffset) / this.viewZoom;
      const position = new Vector3D(0, dy, this.cameraTravelDistance);
      this.showProjectedDot(position, 2.5);
    }
  }

  render() {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.size, this.size);

    ctx.save();
    ctx.translate(this.size / 2, this.size / 2);

    // Force t1 into last phase to emphasize scattering
    const t1 = 1;

    // Disable initial spin/rotation
    // ctx.rotate(-Math.PI * this.ease(t2, 2.7));

    ctx.fillStyle = 'white';
    for (const star of this.stars) {
      star.render(t1, this);
    }

    // Do not draw the initial start dot

    ctx.restore();
  }

  private drawTrail(t1: number) {
    for (let i = 0; i < this.trailLength; i++) {
      const f = this.map(i, 0, this.trailLength, 1.1, 0.1);
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f;

      this.ctx.fillStyle = 'white';
      this.ctx.lineWidth = sw;

      const pathTime = t1 - 0.00015 * i;
      const position = this.spiralPath(pathTime);

      const basePos = position;
      const offset = new Vector2D(position.x + 5, position.y + 5);
      const rotated = this.rotate(
        basePos,
        offset,
        Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
        i % 2 === 0
      );

      this.ctx.beginPath();
      this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  pause() {
    this.timeline.pause();
  }

  resume() {
    this.timeline.play();
  }

  destroy() {
    this.timeline.kill();
  }
}

class Star {
  private dx: number;
  private dy: number;
  private spiralLocation: number;
  private strokeWeightFactor: number;
  private z: number;
  private angle: number;
  private distance: number;
  private rotationDirection: number;
  private expansionRate: number;
  private finalScale: number;

  constructor(cameraZ: number, cameraTravelDistance: number) {
    this.angle = Math.random() * Math.PI * 2;
    this.distance = 30 * Math.random() + 15;
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1;
    this.expansionRate = 1.2 + Math.random() * 0.8;
    this.finalScale = 0.7 + Math.random() * 0.6;

    this.dx = this.distance * Math.cos(this.angle);
    this.dy = this.distance * Math.sin(this.angle);

    this.spiralLocation = (1 - (1 - Math.random()) ** 3.0) / 1.3;
    this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ);

    const lerp = (start: number, end: number, t: number) =>
      start * (1 - t) + end * t;
    this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation);
    this.strokeWeightFactor = Math.random() ** 2.0;
  }

  render(p: number, controller: AnimationController) {
    const spiralPos = controller.spiralPath(this.spiralLocation);
    const q = p - this.spiralLocation;

    if (q > 0) {
      const displacementProgress = controller.constrain(4 * q, 0, 1);

      const linearEasing = displacementProgress;
      const elasticEasing = controller.easeOutElastic(displacementProgress);
      const powerEasing = displacementProgress ** 2;

      let easing: number;
      if (displacementProgress < 0.3) {
        easing = controller.lerp(
          linearEasing,
          powerEasing,
          displacementProgress / 0.3
        );
      } else if (displacementProgress < 0.7) {
        const t = (displacementProgress - 0.3) / 0.4;
        easing = controller.lerp(powerEasing, elasticEasing, t);
      } else {
        easing = elasticEasing;
      }

      let screenX: number;
      let screenY: number;

      if (displacementProgress < 0.3) {
        screenX = controller.lerp(
          spiralPos.x,
          spiralPos.x + this.dx * 0.3,
          easing / 0.3
        );
        screenY = controller.lerp(
          spiralPos.y,
          spiralPos.y + this.dy * 0.3,
          easing / 0.3
        );
      } else if (displacementProgress < 0.7) {
        const midProgress = (displacementProgress - 0.3) / 0.4;
        const curveStrength =
          Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5;

        const baseX = spiralPos.x + this.dx * 0.3;
        const baseY = spiralPos.y + this.dy * 0.3;

        const targetX = spiralPos.x + this.dx * 0.7;
        const targetY = spiralPos.y + this.dy * 0.7;

        const perpX = -this.dy * 0.4 * curveStrength;
        const perpY = this.dx * 0.4 * curveStrength;

        screenX =
          controller.lerp(baseX, targetX, midProgress) + perpX * midProgress;
        screenY =
          controller.lerp(baseY, targetY, midProgress) + perpY * midProgress;
      } else {
        const finalProgress = (displacementProgress - 0.7) / 0.3;

        const baseX = spiralPos.x + this.dx * 0.7;
        const baseY = spiralPos.y + this.dy * 0.7;

        const targetDistance = this.distance * this.expansionRate * 1.5;
        const spiralTurns = 1.2 * this.rotationDirection;
        const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI;

        const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle);
        const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle);

        screenX = controller.lerp(baseX, targetX, finalProgress);
        screenY = controller.lerp(baseY, targetY, finalProgress);
      }

      const vx =
        // biome-ignore lint/suspicious/noExplicitAny:
        ((this.z - (controller as any).cameraZ) * screenX) /
        // biome-ignore lint/suspicious/noExplicitAny:
        (controller as any).viewZoom;
      const vy =
        // biome-ignore lint/suspicious/noExplicitAny:
        ((this.z - (controller as any).cameraZ) * screenY) /
        // biome-ignore lint/suspicious/noExplicitAny:
        (controller as any).viewZoom;

      const position = new Vector3D(vx, vy, this.z);

      let sizeMultiplier = 1.0;
      if (displacementProgress < 0.6) {
        sizeMultiplier = 1.0 + displacementProgress * 0.2;
      } else {
        const t = (displacementProgress - 0.6) / 0.4;
        sizeMultiplier = 1.2 * (1.0 - t) + this.finalScale * t;
      }

      const dotSize = 8.5 * this.strokeWeightFactor * sizeMultiplier;

      controller.showProjectedDot(position, dotSize);
    }
  }
}

export function SpiralAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<AnimationController | null>(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    if (!dimensions.width || !dimensions.height) {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const size = Math.max(dimensions.width, dimensions.height);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${dimensions.width}px`;
    canvas.style.height = `${dimensions.height}px`;
    ctx.scale(dpr, dpr);
    animationRef.current = new AnimationController(canvas, ctx, dpr, size);

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [dimensions]);

  return (
    <div className="relative h-full w-full">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
