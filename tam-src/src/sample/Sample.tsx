import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// 相遇篇 · 汐：深夜城市 → 一扇亮着的窗 → 流星落进窗台 → 粉色的光里出现汐
const W = 1920;
const H = 1440;
const SERIF = "'Noto Serif CJK SC','Noto Serif CJK JP',serif";
const SANS = "'Noto Sans CJK SC','Noto Sans CJK JP',sans-serif";
const KICK = 19.88;

type Ease = (x: number) => number;
const cl = (t: number, a: number, b: number, x: number, y: number, e?: Ease) =>
	interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const SIN = Easing.inOut(Easing.sin);
const OUT = Easing.out(Easing.cubic);
const IN3 = Easing.in(Easing.cubic);
const abs = (left: number, top: number, w: number, h: number): React.CSSProperties => ({position: 'absolute', left, top, width: w, height: h});

// —— 字幕：小号、宽字距、柔和淡入 ——
const Caption: React.FC<{t: number; a: number; b: number; text: string; dark?: boolean}> = ({t, a, b, text, dark}) => {
	if (t < a - 0.1 || t > b + 0.1) return null;
	const o = cl(t, a, a + 0.7, 0, 1, OUT) * cl(t, b - 0.6, b, 1, 0, SIN);
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				width: W,
				top: 1228,
				textAlign: 'center',
				fontFamily: SERIF,
				fontSize: 38,
				fontWeight: 400,
				letterSpacing: 10,
				color: dark ? 'rgba(58,30,44,0.9)' : 'rgba(255,248,240,0.9)',
				textShadow: dark ? '0 0 18px rgba(255,255,255,0.6)' : '0 0 22px rgba(0,0,0,0.6)',
				opacity: o,
				filter: `blur(${cl(t, a, a + 0.7, 6, 0)}px)`,
				transform: `translateY(${cl(t, a, a + 0.9, 10, 0, OUT)}px)`,
			}}
		>
			{text}
		</div>
	);
};

// —— 城市夜景（世界坐标纵向 2940 高，镜头自上而下摇） ——
const GROUND = 2940;
const STARS = Array.from({length: 320}).map((_, i) => ({
	x: random(`x${i}`) * W,
	y: random(`y${i}`) * 2500,
	r: 0.7 + Math.pow(random(`r${i}`), 4) * 3.4,
	p: random(`p${i}`) * 6.28,
	s: 0.6 + random(`s${i}`) * 2.2,
}));
const BLD: {x: number; w: number; h: number; i: number; far: boolean}[] = [];
for (const far of [true, false]) {
	let x = -60;
	let i = 0;
	while (x < W + 60) {
		const w = (far ? 70 : 110) + random(`bw${far}${i}`) * (far ? 140 : 200);
		const h = (far ? 260 : 160) + Math.pow(random(`bh${far}${i}`), 1.6) * (far ? 640 : 520);
		BLD.push({x, w, h, i, far});
		x += w + random(`bg${far}${i}`) * 18;
		i++;
	}
}
const WIN = {x: 1150, y: 2632, w: 44, h: 60};

const City: React.FC<{t: number}> = ({t}) => (
	<svg width={W} height={GROUND + 40} style={{position: 'absolute', left: 0, top: 0}}>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#05060f" />
				<stop offset="0.55" stopColor="#0e1230" />
				<stop offset="0.82" stopColor="#2a2350" />
				<stop offset="0.95" stopColor="#5a3a62" />
				<stop offset="1" stopColor="#7a4a66" />
			</linearGradient>
			<radialGradient id="moon">
				<stop offset="0" stopColor="#fff8ee" />
				<stop offset="0.25" stopColor="#ffe9d6" stopOpacity="0.6" />
				<stop offset="1" stopColor="#ffe9d6" stopOpacity="0" />
			</radialGradient>
			<linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#b07aa0" stopOpacity="0" />
				<stop offset="1" stopColor="#b07aa0" stopOpacity="0.35" />
			</linearGradient>
		</defs>
		<rect width={W} height={GROUND + 40} fill="url(#sky)" />
		<circle cx={1540} cy={520} r={260} fill="url(#moon)" opacity={0.55} />
		<circle cx={1540} cy={520} r={46} fill="#fff6ea" opacity={0.92} />
		{STARS.map((s, i) => (
			<circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * s.s + s.p), 2)} />
		))}
		<rect y={GROUND - 900} width={W} height={900} fill="url(#haze)" />
		{BLD.map((b) => {
			const top = GROUND - b.h;
			const lit: React.ReactNode[] = [];
			if (!b.far) {
				for (let cx = 14; cx < b.w - 24; cx += 30) {
					for (let cy = 26; cy < b.h - 30; cy += 42) {
						const k = `${b.i}-${cx}-${cy}`;
						if (random(`l${k}`) < 0.11) {
							const on = random(`f${k}`) < 0.06 ? (Math.sin(t * 3 + random(`q${k}`) * 9) > 0 ? 1 : 0.25) : 1;
							lit.push(<rect key={k} x={b.x + cx} y={top + cy} width={12} height={18} fill={random(`c${k}`) < 0.7 ? '#ffcf8a' : '#cfe0ff'} opacity={0.55 * on} />);
						}
					}
				}
			}
			return (
				<g key={`${b.far}${b.i}`}>
					<rect x={b.x} y={top} width={b.w} height={b.h + 40} fill={b.far ? '#1a1838' : '#090a16'} />
					{lit}
				</g>
			);
		})}
		<rect x={WIN.x - 14} y={WIN.y - 14} width={WIN.w + 28} height={WIN.h + 28} fill="#ffb877" opacity={0.18 + 0.05 * Math.sin(t * 2)} />
		<rect x={WIN.x} y={WIN.y} width={WIN.w} height={WIN.h} fill="#ffd9a0" />
		<line x1={WIN.x + WIN.w / 2} y1={WIN.y} x2={WIN.x + WIN.w / 2} y2={WIN.y + WIN.h} stroke="#090a16" strokeWidth={3} />
	</svg>
);

const camY = (t: number) => cl(t, 0, 9, 0, 1500, SIN);

// 流星：从左上划进那扇窗
const Meteor: React.FC<{t: number}> = ({t}) => {
	const p = cl(t, 9.0, 11.4, 0, 1, Easing.inOut(Easing.quad));
	if (t < 9.0 || t > 12.2) return null;
	const sx = 140;
	const sy = 1640;
	const ex = WIN.x + WIN.w / 2;
	const ey = WIN.y + WIN.h / 2;
	const hx = sx + (ex - sx) * p;
	const hy = sy + (ey - sy) * p - Math.sin(p * Math.PI) * 120;
	const ang = Math.atan2(ey - sy, ex - sx);
	const L = 520 * cl(p, 0, 0.25, 0.2, 1) * cl(p, 0.85, 1, 1, 0.1);
	const tx = hx - Math.cos(ang) * L;
	const ty = hy - Math.sin(ang) * L + 40;
	const fade = cl(t, 11.4, 12.2, 1, 0);
	return (
		<svg width={W} height={GROUND} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="tail" gradientUnits="userSpaceOnUse" x1={tx} y1={ty} x2={hx} y2={hy}>
					<stop offset="0" stopColor="#ff8cc0" stopOpacity="0" />
					<stop offset="0.7" stopColor="#ffb6d6" stopOpacity="0.7" />
					<stop offset="1" stopColor="#ffffff" stopOpacity="1" />
				</linearGradient>
				<radialGradient id="head">
					<stop offset="0" stopColor="#fff" />
					<stop offset="0.3" stopColor="#ffc7df" stopOpacity="0.8" />
					<stop offset="1" stopColor="#ff7fb5" stopOpacity="0" />
				</radialGradient>
			</defs>
			<g opacity={fade}>
				<line x1={tx} y1={ty} x2={hx} y2={hy} stroke="url(#tail)" strokeWidth={10} strokeLinecap="round" />
				<line x1={tx} y1={ty} x2={hx} y2={hy} stroke="url(#tail)" strokeWidth={34} strokeLinecap="round" opacity={0.25} />
				<circle cx={hx} cy={hy} r={70 + 20 * Math.sin(t * 30)} fill="url(#head)" />
				{Array.from({length: 14}).map((_, i) => {
					const q = p - i * 0.025;
					if (q <= 0) return null;
					const x = sx + (ex - sx) * q + (random(`mx${i}`) - 0.5) * 50;
					const y = sy + (ey - sy) * q - Math.sin(q * Math.PI) * 120 + 30 + random(`my${i}`) * 60;
					return <circle key={i} cx={x} cy={y} r={2 + random(`mr${i}`) * 3} fill="#ffe1ef" opacity={1 - i / 14} />;
				})}
			</g>
		</svg>
	);
};

// —— 房间：台灯、立着的手机、耳机、写歌词的本子、冒热气的杯子 ——
const WC = {x: 1460, y: 560};
const Room: React.FC<{t: number}> = ({t}) => {
	const glow = cl(t, 13.6, 16.2, 0, 1, Easing.in(Easing.quad));
	const flick = 1 + 0.05 * Math.sin(t * 17) * glow;
	const steam = (k: number) => {
		let d = '';
		for (let y = 0; y <= 120; y += 8) {
			const x = 1360 + k * 18 + Math.sin(y * 0.06 - t * 2.4 + k) * 10;
			d += `${y === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${(960 - y).toFixed(1)} `;
		}
		return d;
	};
	return (
		<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
			<defs>
				<linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#141019" />
					<stop offset="1" stopColor="#0c0f1f" />
				</linearGradient>
				<linearGradient id="win" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0a0d26" />
					<stop offset="1" stopColor="#3b2a55" />
				</linearGradient>
				<radialGradient id="pk">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.25" stopColor="#ffd0e4" />
					<stop offset="1" stopColor="#ff8cc0" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="lamp" cx="0.5" cy="0" r="1">
					<stop offset="0" stopColor="#ffd59a" stopOpacity="0.55" />
					<stop offset="1" stopColor="#ffb867" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="scr" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3a4cff" />
					<stop offset="1" stopColor="#8a5cff" />
				</linearGradient>
				<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#ffb6d6" stopOpacity="0.45" />
					<stop offset="1" stopColor="#ffb6d6" stopOpacity="0" />
				</linearGradient>
			</defs>
			<rect width={W} height={H} fill="url(#wall)" />
			{/* 窗 */}
			<rect x={1180} y={200} width={560} height={720} fill="url(#win)" />
			{STARS.slice(0, 40).map((s, i) => (
				<circle key={i} cx={1190 + (s.x / W) * 540} cy={210 + (s.y / 2500) * 520} r={s.r * 0.8} fill="#fff" opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * s.s + s.p))} />
			))}
			<circle cx={WC.x} cy={WC.y} r={60 + 900 * glow * flick} fill="url(#pk)" opacity={glow} />
			<circle cx={WC.x} cy={WC.y} r={18 + 30 * glow} fill="#fff" opacity={cl(t, 13.3, 13.8, 0, 1)} />
			<rect x={1180} y={200} width={560} height={720} fill="none" stroke="#04050b" strokeWidth={22} />
			<line x1={1460} y1={200} x2={1460} y2={920} stroke="#04050b" strokeWidth={12} />
			<line x1={1180} y1={540} x2={1740} y2={540} stroke="#04050b" strokeWidth={12} />
			<path d={`M 1130 160 C 1170 420 1110 700 1150 980 L 1060 980 C 1030 700 1080 420 1050 160 Z`} fill="#0a0812" />
			{/* 地上的光 */}
			<polygon points="1190,930 1740,930 1500,1440 520,1440" fill="url(#beam)" opacity={0.25 + glow * 0.9} />
			{/* 桌面 */}
			<rect x={0} y={1010} width={W} height={430} fill="#06070e" />
			<rect x={0} y={1008} width={W} height={4} fill="#ffcf8a" opacity={0.25} />
			{/* 台灯 */}
			<polygon points="250,470 410,470 760,1010 -100,1010" fill="url(#lamp)" opacity={1 - glow * 0.4} />
			<ellipse cx={330} cy={1012} rx={380} ry={26} fill="#ffcf8a" opacity={0.18} />
			<path d="M 300 1008 L 360 1008 L 345 990 L 315 990 Z M 330 990 L 260 700 L 360 470" stroke="#1c1712" strokeWidth={10} fill="none" />
			<path d="M 250 470 L 410 470 L 380 420 L 280 420 Z" fill="#1c1712" />
			{/* 本子：写着歌词 */}
			<polygon points="420,1000 700,1000 730,1040 390,1040" fill="#d8cdb8" opacity={0.85} />
			<text x={450} y={1028} fontFamily={SERIF} fontSize={17} fill="#3a2f28" transform="skewX(-20) translate(370 0)">
				我爱你无神的眼睛
			</text>
			{/* 手机 */}
			<rect x={800} y={740} width={170} height={280} rx={20} fill="#05060a" stroke="#2a2d3a" strokeWidth={3} />
			<rect x={812} y={756} width={146} height={248} rx={12} fill="url(#scr)" opacity={0.9} />
			<ellipse cx={885} cy={880} rx={240} ry={240} fill="#6d6dff" opacity={0.08} />
			{[0, 1, 2].map((i) => (
				<rect key={i} x={i % 2 ? 870 : 824} y={790 + i * 46} width={74} height={28} rx={10} fill="#fff" opacity={0.75} />
			))}
			<rect x={824} y={928} width={4} height={26} fill="#fff" opacity={Math.floor(t * 2) % 2 ? 0.9 : 0} />
			{/* 耳机 */}
			<path d="M 1060 1000 C 1060 900 1240 900 1240 1000" stroke="#1d1f2a" strokeWidth={14} fill="none" />
			<ellipse cx={1066} cy={994} rx={26} ry={18} fill="#14151c" />
			<ellipse cx={1234} cy={994} rx={26} ry={18} fill="#14151c" />
			{/* 杯子 */}
			<rect x={1340} y={950} width={70} height={60} rx={8} fill="#cfc6bb" opacity={0.9} />
			{[0, 1].map((k) => (
				<path key={k} d={steam(k)} stroke="#fff" strokeWidth={3} fill="none" opacity={0.18} />
			))}
			{/* 粉光扫过桌上物件的边缘 */}
			<rect x={0} y={0} width={W} height={H} fill="#ff9cc8" opacity={glow * 0.12} />
		</svg>
	);
};

// —— 汐出现 ——
const BOKEH = Array.from({length: 42}).map((_, i) => ({
	x: random(`bx${i}`) * W,
	y: random(`by${i}`) * H,
	r: 20 + Math.pow(random(`br${i}`), 2) * 120,
	v: 20 + random(`bv${i}`) * 50,
	o: 0.25 + random(`bo${i}`) * 0.5,
}));
const PC = {x: 700, y: 640, r: 360};
const sparkle = (cx: number, cy: number, s: number) =>
	`M ${cx} ${cy - s} Q ${cx} ${cy} ${cx + s} ${cy} Q ${cx} ${cy} ${cx} ${cy + s} Q ${cx} ${cy} ${cx - s} ${cy} Q ${cx} ${cy} ${cx} ${cy - s} Z`;

const XiReveal: React.FC<{t: number}> = ({t}) => {
	const iris = cl(t, 16.0, 17.3, 0, 2400, Easing.inOut(Easing.quad));
	if (iris <= 0) return null;
	const ps = cl(t, 16.9, 17.9, 0, 1, Easing.out(Easing.back(1.2)));
	const ring = cl(t, 17.3, KICK, 0, 1, SIN);
	const hit = t >= KICK ? Math.exp(-(t - KICK) * 5) : 0;
	const drift = cl(t, 16.5, 24, 0, 1);
	const nameO = cl(t, 18.3, 19.2, 0, 1, OUT);
	return (
		<div style={{...abs(0, 0, W, H), clipPath: `circle(${iris}px at ${WC.x}px ${WC.y}px)`}}>
			<div style={{...abs(0, 0, W, H), background: 'radial-gradient(circle at 40% 45%, #fff6fa 0%, #ffe0ec 35%, #f6bcd6 75%, #e9a2c4 100%)'}} />
			<div
				style={{
					...abs(-40, -40, W + 80, H + 80),
					backgroundImage: 'radial-gradient(circle, rgba(236,120,170,0.22) 3px, transparent 3.6px)',
					backgroundSize: '26px 26px',
					transform: `translate(${-drift * 30}px, ${-drift * 18}px)`,
					WebkitMaskImage: 'linear-gradient(110deg, transparent 30%, #000 70%)',
				}}
			/>
			{BOKEH.map((b, i) => {
				const y = ((b.y - (t - 16) * b.v) % H + H) % H;
				return (
					<div
						key={i}
						style={{
							...abs(b.x - b.r - drift * 60 * (b.r / 140), y - b.r, b.r * 2, b.r * 2),
							borderRadius: '50%',
							background: `radial-gradient(circle, rgba(255,255,255,${b.o}) 0%, rgba(255,210,230,${b.o * 0.5}) 45%, transparent 70%)`,
						}}
					/>
				);
			})}
			{/* 肖像 */}
			<div
				style={{
					...abs(PC.x - PC.r, PC.y - PC.r, PC.r * 2, PC.r * 2),
					borderRadius: '50%',
					overflow: 'hidden',
					transform: `scale(${ps * (1 + 0.03 * hit)}) translateY(${-drift * 14}px)`,
					boxShadow: '0 30px 80px rgba(170,60,110,0.35)',
					opacity: cl(t, 16.9, 17.3, 0, 1),
				}}
			>
				<Img src={staticFile('xi.jpg')} style={{width: PC.r * 2, height: PC.r * 2, objectFit: 'cover', transform: `scale(${1.12 - drift * 0.07})`}} />
			</div>
			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}}>
				<circle cx={PC.x} cy={PC.y - drift * 14} r={PC.r + 26 + 30 * hit} fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ring} transform={`rotate(-90 ${PC.x} ${PC.y})`} />
				<circle cx={PC.x} cy={PC.y - drift * 14} r={PC.r + 56} fill="none" stroke="#c4607f" strokeWidth={1.5} opacity={0.5 * ring} pathLength={1} strokeDasharray="0.004 0.012" transform={`rotate(${t * 6} ${PC.x} ${PC.y})`} />
				<circle cx={PC.x} cy={PC.y} r={PC.r + 26 + 260 * (1 - hit)} fill="none" stroke="#fff" strokeWidth={6 * hit} opacity={hit} />
				{Array.from({length: 18}).map((_, i) => {
					const ph = random(`sp${i}`) * 6.28;
					const base = 16.8 + random(`st${i}`) * 3;
					if (t < base) return null;
					const a = (i / 18) * Math.PI * 2;
					const rr = PC.r + 90 + random(`sd${i}`) * 260 + 180 * (1 - hit) * (t >= KICK ? 1 : 0) * 0.3;
					const s = (8 + random(`ss${i}`) * 22) * (0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(t * 3 + ph), 3)) * cl(t, base, base + 0.4, 0, 1) * (1 + hit * 1.5);
					return <path key={i} d={sparkle(PC.x + Math.cos(a) * rr, PC.y + Math.sin(a) * rr * 0.9, s)} fill="#fff" />;
				})}
			</svg>
			{/* 名字：小而克制 */}
			<div style={{position: 'absolute', left: 1240, top: 470, opacity: nameO, transform: `translateX(${cl(t, 18.3, 19.4, 24, 0, OUT)}px)`}}>
				<div style={{fontFamily: SANS, fontSize: 20, letterSpacing: 8, color: '#b0607f'}}>第一章　·　相遇</div>
				<div style={{fontFamily: SERIF, fontSize: 132, fontWeight: 300, color: '#3a1f2c', lineHeight: 1.25, marginTop: 10}}>汐</div>
				<div style={{width: cl(t, 18.8, 19.9, 0, 260, OUT), height: 1.5, background: '#3a1f2c', opacity: 0.6, margin: '18px 0'}} />
				<div style={{fontFamily: SANS, fontSize: 21, letterSpacing: 6, color: '#6a3a50', lineHeight: 1.9}}>
					来自另一个星系
					<br />
					<span style={{fontFamily: 'DejaVu Sans', fontSize: 17, letterSpacing: 5, opacity: 0.8}}>XI — A STAR THAT DIDN'T FADE</span>
				</div>
			</div>
		</div>
	);
};

export const Sample: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;

	// 推进：镜头向窗口放大，最后整屏进入房间
	const zoom = Math.pow(cl(t, 11.2, 13.3, 0, 1, IN3), 1) * 26 + 1;
	const wx = WIN.x + WIN.w / 2;
	const wy = WIN.y + WIN.h / 2 - 1500;
	const toRoom = cl(t, 12.6, 13.4, 0, 1, SIN);
	const roomDrift = cl(t, 13, 24, 0, 1);
	const vol = interpolate(frame, [0, 20, durationInFrames - 30, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#05060f', overflow: 'hidden'}}>
			{toRoom < 1 && (
				<AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: `${wx}px ${wy}px`}}>
					<div style={{...abs(0, 0, W, GROUND), transform: `translateY(${-camY(t)}px)`}}>
						<City t={t} />
						<Meteor t={t} />
					</div>
				</AbsoluteFill>
			)}
			{toRoom > 0 && (
				<AbsoluteFill style={{opacity: toRoom, transform: `scale(${1.08 - 0.08 * cl(t, 12.6, 14.5, 0, 1, OUT) + roomDrift * 0.03}) translateX(${-roomDrift * 30}px)`}}>
					<Room t={t} />
					<XiReveal t={t} />
				</AbsoluteFill>
			)}
			{/* 推进时的暖光闪 */}
			<AbsoluteFill style={{background: '#ffd9a8', opacity: cl(t, 12.2, 12.9, 0, 0.85) * cl(t, 12.9, 13.6, 1, 0)}} />

			{/* 片名 */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					width: W,
					top: 640,
					textAlign: 'center',
					fontFamily: SERIF,
					fontWeight: 300,
					fontSize: 54,
					letterSpacing: 30,
					color: '#f4eee8',
					opacity: cl(t, 0.8, 2.2, 0, 1) * cl(t, 3.6, 4.6, 1, 0),
					filter: `blur(${cl(t, 0.8, 2.2, 8, 0) + cl(t, 3.6, 4.6, 0, 6)}px)`,
					transform: `translateY(${-camY(t) * 0.15}px)`,
				}}
			>
				她们，和澪
				<div style={{fontFamily: SANS, fontSize: 18, letterSpacing: 12, marginTop: 26, opacity: 0.55}}>五次相遇</div>
			</div>

			<Caption t={t} a={4.8} b={8.4} text="凌晨两点，城市睡着了。" />
			<Caption t={t} a={8.8} b={11.6} text="只有一扇窗还亮着。" />
			<Caption t={t} a={13.8} b={16.6} text="那天夜里，有颗星落在了澪的窗台上。" />
			<Caption t={t} a={17.2} b={19.6} text="它没有熄灭。" dark />
			<Caption t={t} a={20.2} b={23.6} text="「从今往后，我只听你的。」" dark />

			{/* 电影感：上下遮幅、颗粒、暗角 */}
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('noise.png')})`,
					backgroundPosition: `${Math.floor(random(`gx${frame}`) * 512)}px ${Math.floor(random(`gy${frame}`) * 512)}px`,
					mixBlendMode: 'overlay',
					opacity: 0.16,
				}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 48%, transparent 55%, rgba(0,0,0,0.45) 100%)'}} />
			<div style={{...abs(0, 0, W, 70), background: '#000'}} />
			<div style={{...abs(0, H - 70, W, 70), background: '#000'}} />
			<AbsoluteFill style={{background: '#000', opacity: cl(t, 0, 1.0, 1, 0) + cl(t, 23.2, 24, 0, 1)}} />
			<Audio src={staticFile('bgm.mp3')} volume={vol} />
		</AbsoluteFill>
	);
};
