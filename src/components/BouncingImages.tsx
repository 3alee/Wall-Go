import { useEffect, useRef } from "react";
import { PLAYER_IMAGES, WALL_IMAGES_H} from "../lib/Elements";


const images = [
    { src: PLAYER_IMAGES[0], width: 40, height: 40 },
    { src: PLAYER_IMAGES[0], width: 40, height: 40 },
    { src: PLAYER_IMAGES[0], width: 40, height: 40 },
    { src: WALL_IMAGES_H[0], width: 70, height: 20 },
    { src: WALL_IMAGES_H[0], width: 70, height: 20 },
    { src: PLAYER_IMAGES[1], width: 50, height: 50 },
    { src: PLAYER_IMAGES[1], width: 50, height: 50 },
    { src: PLAYER_IMAGES[1], width: 50, height: 50 },
    { src: WALL_IMAGES_H[1], width: 70, height: 20 },
    { src: WALL_IMAGES_H[1], width: 70, height: 20 },
    { src: PLAYER_IMAGES[2], width: 50, height: 50 },
    { src: PLAYER_IMAGES[2], width: 50, height: 50 },
    { src: PLAYER_IMAGES[2], width: 50, height: 50 },
    { src: WALL_IMAGES_H[2], width: 70, height: 20 },
    { src: WALL_IMAGES_H[2], width: 70, height: 20 },
    { src: PLAYER_IMAGES[3], width: 50, height: 50 },
    { src: PLAYER_IMAGES[3], width: 50, height: 50 },
    { src: PLAYER_IMAGES[3], width: 50, height: 50 },
    { src: WALL_IMAGES_H[3], width: 70, height: 20 },
    { src: WALL_IMAGES_H[3], width: 70, height: 20 },
];

type Velocity = { dx: number; dy: number };
type Position = { x: number; y: number };
type Rotation = { angle: number; dr: number };

function BouncingImages() {
    const containerRef = useRef<HTMLDivElement | null>(null);;
    const imgRefs = useRef<(HTMLImageElement | null)[]>([]);
    const velocities = useRef<Velocity[]>([]);
    const positions = useRef<Position[]>([]);
    const rotations = useRef<Rotation[]>([]);

    useEffect(() => {
        function initializeAndAnimate() {
            const container = containerRef.current;
            if (!container) return;
                const containerRect = container.getBoundingClientRect();
                const numImages = images.length;

                positions.current = Array(numImages).fill(null).map(() => ({
                    x: Math.random() * (containerRect.width - 60),
                    y: Math.random() * (containerRect.height - 60),
                }));

                velocities.current = Array(numImages).fill(null).map(() => ({
                    dx: (Math.random() - 0.5) * 3,
                    dy: (Math.random() - 0.5) * 3,
                }));

                rotations.current = Array(numImages).fill(null).map(() => ({
                    angle: 0,
                    dr: (Math.random() - 0.5) * 4,
                }));

        function animate() {
            const container = containerRef.current;
            if (!container) return;
            const containerRect = container.getBoundingClientRect();

            for (let i = 0; i < numImages; i++) {
                    const img = imgRefs.current[i];
                    const pos = positions.current[i];
                    const vel = velocities.current[i];
                    const rot = rotations.current[i];
                    const imgData = images[i];

                    if (!img) continue;

                    pos.x += vel.dx;
                    pos.y += vel.dy;
                    rot.angle += rot.dr;

                    // Bounce on X
                    if (pos.x < 0 || pos.x > containerRect.width - imgData.width) {
                        vel.dx *= -1;
                        pos.x = Math.max(0, Math.min(containerRect.width - imgData.width, pos.x));
                        rot.dr = (Math.random() < 0.5 ? -1 : 1) * Math.abs(vel.dy) * 2;
                    }

                    // Bounce on Y
                    if (pos.y < 0 || pos.y > containerRect.height - imgData.height) {
                        vel.dy *= -1;
                        pos.y = Math.max(0, Math.min(containerRect.height - imgData.height, pos.y));
                        rot.dr = (Math.random() < 0.5 ? -1 : 1) * Math.abs(vel.dx) * 2;
                    }
                    rot.angle += rot.dr;

                    img.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rot.angle}deg)`;
                }

                requestAnimationFrame(animate);
            }

            animate();
        }

        // Delay animation start to ensure DOM is laid out
        const timeout = setTimeout(() => {
            initializeAndAnimate();
        }, 0);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div>
            <div
                ref={containerRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    overflow: "hidden",
                    zIndex: -10,
                }}
            >
                {images.map((img, i) => (
                    <img
                        key={i}
                        ref={(el) => {
                            (imgRefs.current[i] = el)}
                        }
                        src={img.src}
                        alt={`bounce-${i}`}
                        width={img.width}
                        height={img.height}
                        style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            willChange: "transform",
                            pointerEvents: "none",
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "rgba(255, 255, 255, 0)", // semi-transparent black
                    borderRadius: "40px",
                    zIndex: -5, // higher than bouncing images
                    width: "100vw",
                    height: "100vh",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                }}
            >
            </div>
        </div>
    );
}

export default BouncingImages;
