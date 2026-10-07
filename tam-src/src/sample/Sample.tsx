import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// 世界坐标：1920×1440 一屏，镜头在横向长画布上追着「声音线」走
const H = 1440;
const WORLD_W = 9800;
const MUSIC_START = 19.88;
const KICKS = [0, 0.62, 1.23, 1.85, 2.46, 3.08, 3.71, 4.32, 4.94, 5.55, 6.17, 6.8, 7.4, 8.03, 8.63, 9.26, 9.87];
const LANDS = [2.47, 4.94, 8.63];
const SERIF = "'Noto Serif CJK SC','Noto Serif CJK JP','Source Han Serif SC',serif";
const SANS = "'Noto Sans CJK SC','Noto Sans CJK JP','Source Han Sans SC',sans-serif";
const MONO = "'DejaVu Sans Mono',monospace";

type Ease = (x: number) => number;
const cl = (t: number, a: number, b: number, x: number, y: number, e?: Ease) =>
	interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const OUT = Easing.out(Easing.cubic);
const OUTX = Easing.out(Easing.exp);
const INOUT = Easing.inOut(Easing.cubic);
const WHIP = Easing.bezier(0.8, 0, 0.12, 1);
const pulse = (t: number, list: number[], k: number) => {
	let v = 0;
	for (const l of list) if (t >= l) v = Math.max(v, Math.exp(-(t - l) * k));
	return v;
};

const camX = (t: number) => {
	if (t < 2.05) return cl(t, 0, 2.05, 0, 520, Easing.inOut(Easing.sin));
	if (t < 2.47) return cl(t, 2.05, 2.47, 520, 2240, WHIP);
	if (t < 4.62) return cl(t, 2.47, 4.62, 2240, 2380);
	if (t < 4.94) return cl(t, 4.62, 4.94, 2380, 4640, WHIP);
	if (t < 8.3) return cl(t, 4.94, 8.3, 4640, 4800);
	if (t < 8.63) return cl(t, 8.3, 8.63, 4800, 7040, WHIP);
	return cl(t, 8.63, 10, 7040, 7130);
};

const wavePath = (x0: number, x1: number, f: (x: number) => number, step = 10) => {
	if (x1 <= x0 + 1) return '';
	let d = `M ${x0.toFixed(1)} ${f(x0).toFixed(1)}`;
	for (let x = x0 + step; x < x1; x += step) d += ` L ${x.toFixed(1)} ${f(x).toFixed(1)}`;
	return d + ` L ${x1.toFixed(1)} ${f(x1).toFixed(1)}`;
};

const GlowPath: React.FC<{d: string; core: string; glow: string; w?: number; op?: number}> = ({d, core, glow, w = 6, op = 1}) =>
	d ? (
		<g opacity={op}>
			<path d={d} fill="none" stroke={glow} strokeWidth={w * 6} strokeLinecap="round" strokeLinejoin="round" opacity={0.3} filter="url(#blurL)" />
			<path d={d} fill="none" stroke={glow} strokeWidth={w * 2.2} strokeLinecap="round" strokeLinejoin="round" opacity={0.65} filter="url(#blurS)" />
			<path d={d} fill="none" stroke={core} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
		</g>
	) : null;

const star = (cx: number, cy: number, s: number) =>
	`M ${cx} ${cy - s} Q ${cx} ${cy} ${cx + s} ${cy} Q ${cx} ${cy} ${cx} ${cy + s} Q ${cx} ${cy} ${cx - s} ${cy} Q ${cx} ${cy} ${cx} ${cy - s} Z`;

const abs = (left: number, top: number, w: number, h: number): React.CSSProperties => ({position: 'absolute', left, top, width: w, height: h});

// —— 开头：五个名字随鼓点砸进来，声音线在前面穿过 ——
const GLYPHS = [
	{c: '汐', col: '#ffb3d1', t: 0, x: 220, y: 230, r: -6},
	{c: '潮', col: '#f2efe6', t: 0.32, x: 1020, y: 300, r: 4},
	{c: '霜', col: '#bfe6ff', t: 0.62, x: 520, y: 420, r: -3},
	{c: '芯', col: '#a56dff', t: 1.23, x: 1180, y: 190, r: 5},
	{c: '茹', col: '#b8b8b8', t: 1.85, x: 860, y: 380, r: -4},
];

const Opening: React.FC<{t: number}> = ({t}) => (
	<>
		<div style={{...abs(-400, 0, 3200, H), background: '#0c0a12'}} />
		<div
			style={{
				...abs(-400, 0, 3200, H),
				backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 2px, transparent 2.6px)',
				backgroundSize: '24px 24px',
				backgroundPosition: `${t * 30}px 0px`,
			}}
		/>
		{GLYPHS.map((g, i) => {
			const age = t - g.t;
			if (age < 0) return null;
			const sc = 1 + 0.22 * Math.exp(-age * 9);
			const fill = cl(age, 0, 0.06, 0, 1) * cl(age, 0.2, 0.45, 1, 0);
			const line = cl(age, 0, 0.05, 0, 1) * cl(age, 0.45, 1.7, 1, 0.2);
			const base: React.CSSProperties = {
				position: 'absolute',
				left: g.x,
				top: g.y,
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: 900,
				lineHeight: 1,
				transform: `rotate(${g.r}deg) scale(${sc})`,
				transformOrigin: '50% 50%',
			};
			return (
				<React.Fragment key={i}>
					<div
						style={{
							...abs(g.x - 700, g.y + 330, 2600, 210),
							background: g.col,
							opacity: age < 0.34 ? 0.92 : 0,
							transform: `rotate(-14deg) translateX(${cl(age, 0, 0.34, -1700, 1700, INOUT)}px)`,
						}}
					/>
					<div style={{...base, color: 'transparent', WebkitTextStroke: `5px ${g.col}`, opacity: line}}>{g.c}</div>
					<div
						style={{
							...base,
							color: g.col,
							opacity: fill,
							WebkitMaskImage: `repeating-linear-gradient(0deg, #000 0 40px, transparent 40px 54px)`,
							maskImage: `repeating-linear-gradient(0deg, #000 0 40px, transparent 40px 54px)`,
							WebkitMaskPosition: `0 ${age * 300}px`,
						}}
					>
						{g.c}
					</div>
				</React.Fragment>
			);
		})}
	</>
);

// —— 汐：光环、粉彩、黑色缎带 ——
const HX = 3420;
const HY = 290;
const HR = 200;
const PX = 3420;
const PY = 830;
const XI_ONSETS = [2.78, 3.08, 3.55, 3.69, 3.85, 4.32, 4.48];

const XiZone: React.FC<{t: number}> = ({t}) => {
	const R = cl(t, 2.38, 2.95, 0, 2900, OUTX);
	const r = cl(t, 2.47, 2.95, 0, 430, Easing.out(Easing.back(1.4))) + 28 * pulse(t, [3.08, 3.71, 4.32], 9);
	const split = cl(t, 3.71, 3.8, 0, 1, OUT) * cl(t, 4.12, 4.32, 1, 0, INOUT);
	const S = 900;
	const N = 5;
	return (
		<>
			{R > 0 && (
				<div
					style={{
						...abs(HX - R, HY - R, 2 * R, 2 * R),
						borderRadius: '50%',
						background: 'radial-gradient(circle, #fff4f8 0%, #ffd0e3 30%, #f9b0d0 62%, #f096bf 100%)',
					}}
				/>
			)}
			<div
				style={{
					...abs(2200, 0, 2400, H),
					backgroundImage: 'radial-gradient(circle, rgba(255,95,160,0.5) 5px, transparent 6px)',
					backgroundSize: '30px 30px',
					backgroundPosition: `${t * 24}px ${t * 14}px`,
					WebkitMaskImage: 'radial-gradient(circle at 52% 56%, transparent 24%, #000 42%, transparent 78%)',
					opacity: cl(t, 2.5, 2.95, 0, 1),
				}}
			/>
			{r > 1 && (
				<div style={{...abs(PX - S / 2, PY - S / 2, S, S), clipPath: `circle(${r}px at 50% 50%)`}}>
					{Array.from({length: N}).map((_, i) => (
						<div
							key={i}
							style={{
								...abs(0, 0, S, S),
								clipPath: `inset(0px ${S - ((i + 1) * S) / N}px 0px ${(i * S) / N}px)`,
								transform: `translateY(${split * (i % 2 ? 1 : -1) * (70 + i * 16)}px)`,
							}}
						>
							<Img
								src={staticFile('xi.jpg')}
								style={{width: S, height: S, objectFit: 'cover', transform: `scale(${1.04 + 0.05 * cl(t, 2.47, 4.9, 0, 1)})`}}
							/>
						</div>
					))}
				</div>
			)}
		</>
	);
};

const XiFront: React.FC<{t: number}> = ({t}) => {
	const r = cl(t, 2.47, 2.95, 0, 430, Easing.out(Easing.back(1.4))) + 28 * pulse(t, [3.08, 3.71, 4.32], 9);
	const halo = cl(t, 2.18, 2.5, 0, 1, INOUT);
	const pA = cl(t, 3.08, 3.45, 0, 1, OUT);
	const pB = cl(t, 3.71, 4.06, 0, 1, OUT);
	const bow = cl(t, 3.08, 3.3, 0, 1, Easing.out(Easing.back(2)));
	const ribA = `M ${PX - 560} 1460 C ${PX - 780} 1020 ${PX - 740} 520 ${PX - 300} 330`;
	const ribB = `M ${PX + 560} 1460 C ${PX + 780} 1020 ${PX + 740} 520 ${PX + 300} 330`;
	return (
		<>
			{halo > 0 && (
				<g>
					<circle cx={HX} cy={HY} r={HR + 30 * pulse(t, [3.08, 3.71, 4.32], 8)} fill="none" stroke="#ff5fa2" strokeWidth={44} opacity={0.35} filter="url(#blurL)" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - halo} transform={`rotate(180 ${HX} ${HY})`} />
					<circle cx={HX} cy={HY} r={HR + 30 * pulse(t, [3.08, 3.71, 4.32], 8)} fill="none" stroke="#ffffff" strokeWidth={11} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - halo} transform={`rotate(180 ${HX} ${HY})`} />
					<circle cx={HX} cy={HY} r={HR + 48} fill="none" stroke="#2a0f1d" strokeWidth={3} opacity={cl(t, 2.5, 2.8, 0, 0.7)} pathLength={1} strokeDasharray="0.012 0.022" transform={`rotate(${t * 40} ${HX} ${HY})`} />
				</g>
			)}
			{r > 2 && (
				<>
					<circle cx={PX} cy={PY} r={r + 16} fill="none" stroke="#1b0f15" strokeWidth={9} />
					<circle cx={PX} cy={PY} r={r + 46} fill="none" stroke="#ffffff" strokeWidth={3} pathLength={1} strokeDasharray="0.006 0.012" transform={`rotate(${-t * 25} ${PX} ${PY})`} />
				</>
			)}
			<path d={ribA} fill="none" stroke="#141014" strokeWidth={28} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pA} />
			<path d={ribB} fill="none" stroke="#141014" strokeWidth={28} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - pB} />
			{bow > 0 && (
				<g transform={`translate(${HX - 250} ${HY - 120}) scale(${bow}) rotate(-18)`}>
					<path d="M 0 0 L -95 -55 L -95 55 Z M 0 0 L 95 -55 L 95 55 Z" fill="#141014" />
					<circle cx={0} cy={0} r={18} fill="#141014" />
				</g>
			)}
			{XI_ONSETS.map((o, i) => {
				const age = t - o;
				if (age < 0 || age > 0.5) return null;
				const k = Math.sin(Math.PI * (age / 0.5));
				const x = PX + (random(`sx${i}`) - 0.5) * 1500;
				const y = 140 + random(`sy${i}`) * 1150;
				const s = (55 + random(`ss${i}`) * 75) * k;
				return <path key={i} d={star(x, y, s)} fill="#ffffff" filter="url(#glowStar)" />;
			})}
		</>
	);
};

const XiText: React.FC<{t: number}> = ({t}) => {
	if (t < 2.4) return null;
	const sc = 1 + 0.045 * pulse(t, [3.08, 3.71, 4.32], 10);
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: 2440,
					top: 300,
					fontFamily: SERIF,
					fontWeight: 900,
					fontSize: 660,
					lineHeight: 1,
					color: '#1a0e14',
					textShadow: '22px 22px 0 #ff7fb0',
					opacity: cl(t, 2.47, 2.58, 0, 1),
					transform: `translateX(${cl(t, 2.47, 2.9, -320, 0, OUTX)}px) scale(${sc})`,
				}}
			>
				汐
			</div>
			<div style={{...abs(2450, 1030, cl(t, 2.7, 3.1, 0, 470, OUT), 5), background: '#1a0e14'}} />
			<div style={{position: 'absolute', left: 2450, top: 1060, fontFamily: MONO, fontWeight: 700, fontSize: 64, letterSpacing: 14, color: '#1a0e14', opacity: cl(t, 2.8, 3.0, 0, 1)}}>
				XI
			</div>
			<div style={{position: 'absolute', left: 2455, top: 1150, fontFamily: MONO, fontSize: 30, letterSpacing: 10, color: '#4a2333', opacity: cl(t, 2.9, 3.1, 0, 1)}}>
				01 / 06
			</div>
		</>
	);
};

// —— 潮：报纸、故障错位、扫描线 ——
const CX = 5600;
const CS = 1040;
const CT = 240;
const POOL = '潮汐夜雨风声线信号噪点黑白新闻纸页字句回声城市灯影时间记忆电波频率断续覆盖重写删除未读今天明天凌晨窗外街口列车站台消息';

const paperEdge = (() => {
	const pts: string[] = [];
	for (let k = 0; k <= 30; k++) pts.push(`${(random(`pe${k}`) * 46).toFixed(0)}px ${((k / 30) * H).toFixed(0)}px`);
	return `polygon(${pts.join(',')}, 3000px ${H}px, 3000px 0px)`;
})();

const COLUMNS = Array.from({length: 18}).map((_, i) =>
	Array.from({length: 44})
		.map((__, j) => POOL[Math.floor(random(`ch${i}-${j}`) * POOL.length)])
		.join(''),
);

const ChaoZone: React.FC<{t: number}> = ({t}) => {
	const ki = KICKS.filter((k) => k <= t).length;
	const g = t > 4.9 ? Math.max(pulse(t, [5.55, 6.17, 7.4], 12), 2 * pulse(t, [6.8], 8)) + 0.05 : 0;
	const zoom = 1 + 0.45 * cl(t, 7.4, 8.0, 0, 1, OUTX);
	const ht = cl(t, 7.4, 7.52, 0, 1);
	const ds = cl(t, 7.4, 8.05, 9, 30);
	const scanY = cl(t, 5.0, 6.75, 140, 1330, Easing.inOut(Easing.sin));
	const N = 14;
	const sh = CS / N;
	const imgF = 'grayscale(1) contrast(1.6) brightness(1.06)';
	return (
		<>
			<div style={{...abs(4060, 0, 3000, H), background: '#ebe6d8', clipPath: paperEdge}}>
				{COLUMNS.map((s, i) => (
					<div
						key={i}
						style={{position: 'absolute', left: 70 + i * 164, top: 50, writingMode: 'vertical-rl', fontFamily: SERIF, fontSize: 30, lineHeight: 1.25, letterSpacing: 4, color: 'rgba(30,26,22,0.26)'}}
					>
						{s}
					</div>
				))}
			</div>
			<div style={{...abs(CX - CS / 2, CT, CS, CS), transform: `scale(${zoom})`, transformOrigin: '50% 38%', mixBlendMode: 'multiply'}}>
				<div style={{...abs(0, 0, CS, CS), opacity: 1 - ht * 0.88}}>
					{Array.from({length: N}).map((_, i) => (
						<div
							key={i}
							style={{
								...abs(0, 0, CS, CS),
								clipPath: `inset(${i * sh}px 0px ${CS - (i + 1) * sh}px 0px)`,
								transform: `translateX(${g * (random(`c${i}-${ki}`) - 0.5) * 300}px)`,
							}}
						>
							<Img src={staticFile('chao.jpg')} style={{width: CS, height: CS, objectFit: 'cover', filter: imgF}} />
						</div>
					))}
				</div>
				<Img src={staticFile('chao.jpg')} style={{...abs(g * 34, 0, CS, CS), objectFit: 'cover', mixBlendMode: 'multiply', opacity: Math.min(1, g * 0.85), filter: `${imgF} sepia(1) saturate(12) hue-rotate(-45deg)`}} />
				<Img src={staticFile('chao.jpg')} style={{...abs(-g * 34, 0, CS, CS), objectFit: 'cover', mixBlendMode: 'multiply', opacity: Math.min(1, g * 0.85), filter: `${imgF} sepia(1) saturate(10) hue-rotate(140deg)`}} />
				{ht > 0 && (
					<div
						style={{
							...abs(0, 0, CS, CS),
							opacity: ht,
							WebkitMaskImage: 'radial-gradient(circle, #000 40%, transparent 45%)',
							WebkitMaskSize: `${ds}px ${ds}px`,
						}}
					>
						<Img src={staticFile('chao.jpg')} style={{width: CS, height: CS, objectFit: 'cover', filter: 'grayscale(1) contrast(2.2)'}} />
					</div>
				)}
			</div>
			{t >= 5.0 && t < 6.8 && <div style={{...abs(CX - CS / 2, CT, CS, Math.max(0, scanY - CT)), background: '#ffffff', mixBlendMode: 'difference'}} />}
		</>
	);
};

const ChaoText: React.FC<{t: number}> = ({t}) => {
	const a1 = t - 5.55;
	const a2 = t - 6.17;
	const bar = '潮　CHAO　／　'.repeat(12);
	return (
		<>
			{a1 >= 0 && (
				<div style={{...abs(4540, 0, 2500, 150), background: '#0d0d0d', overflow: 'hidden', transform: `translateY(${cl(a1, 0, 0.2, -170, 0, OUTX)}px)`}}>
					<div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: '150px', color: '#f2efe6', transform: `translateX(${-a1 * 280}px)`}}>{bar}</div>
				</div>
			)}
			{a2 >= 0 && (
				<div style={{...abs(4540, 1290, 2500, 150), background: '#e8304a', overflow: 'hidden', transform: `translateY(${cl(a2, 0, 0.2, 170, 0, OUTX)}px)`}}>
					<div style={{whiteSpace: 'nowrap', fontFamily: SANS, fontWeight: 900, fontSize: 76, lineHeight: '150px', color: '#0d0d0d', transform: `translateX(${-1400 + a2 * 280}px)`}}>{bar}</div>
				</div>
			)}
			{a1 >= 0 && (
				<div
					style={{
						position: 'absolute',
						left: 4740,
						top: 300,
						background: '#ffffff',
						border: '12px solid #0d0d0d',
						padding: '0 34px',
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 560,
						lineHeight: 1.08,
						color: '#0d0d0d',
						boxShadow: '20px 20px 0 #0d0d0d',
						transform: `rotate(-5deg) scale(${cl(a1, 0, 0.16, 1.8, 1, Easing.in(Easing.quad))}) translate(${a1 > 0.16 && a1 < 0.32 ? (random(`sk${Math.floor(a1 * 60)}`) - 0.5) * 22 : 0}px, 0px)`,
					}}
				>
					潮
				</div>
			)}
			{a2 >= 0 && (
				<>
					<div style={{position: 'absolute', left: 5900, top: 1050, background: '#0d0d0d', color: '#f2efe6', fontFamily: MONO, fontWeight: 700, fontSize: 96, letterSpacing: 12, padding: '6px 26px', transform: `rotate(4deg) scale(${cl(a2, 0, 0.14, 1.6, 1, Easing.in(Easing.quad))})`}}>
						CHAO
					</div>
					<div style={{position: 'absolute', left: 6020, top: 300, background: '#ffffff', border: '6px solid #0d0d0d', color: '#0d0d0d', fontFamily: MONO, fontWeight: 700, fontSize: 54, padding: '4px 20px', transform: `rotate(-3deg) scale(${cl(a2, 0.05, 0.19, 1.6, 1, Easing.in(Easing.quad))})`, opacity: a2 > 0.05 ? 1 : 0}}>
						02 / 06
					</div>
				</>
			)}
		</>
	);
};

// —— 撕开报纸，进入霜 ——
const TX = 6380;
const ICE = 'linear-gradient(180deg, #f2fbff 0%, #cfe6ff 45%, #9ab7ff 100%)';
const tearPoly = (w: number, extra: number) => {
	const L: string[] = [];
	const Rr: string[] = [];
	for (let k = 0; k <= 22; k++) {
		const y = (k / 22) * 1540;
		L.push(`${(1400 - w - extra + (random(`tl${k}`) - 0.5) * 70).toFixed(0)}px ${y.toFixed(0)}px`);
		Rr.unshift(`${(1400 + w + extra + (random(`tr${k}`) - 0.5) * 70).toFixed(0)}px ${y.toFixed(0)}px`);
	}
	return `polygon(${[...L, ...Rr].join(',')})`;
};

const Tear: React.FC<{t: number}> = ({t}) => {
	const w = cl(t, 8.03, 8.45, 0, 1150, Easing.in(Easing.cubic));
	if (w < 1) return null;
	return (
		<>
			<div style={{...abs(TX - 1400, -50, 2800, 1540), background: '#fbfaf5', clipPath: tearPoly(w, 20)}} />
			<div style={{...abs(TX - 1400, -50, 2800, 1540), background: ICE, clipPath: tearPoly(w, 0)}} />
		</>
	);
};

const ZX = 8180;
const ZY = 760;
const hexClip = (s: number) => {
	const pts: string[] = [];
	for (let k = 0; k < 6; k++) {
		const a = ((-90 + k * 60) * Math.PI) / 180;
		pts.push(`${(50 + 50 * s * Math.cos(a)).toFixed(2)}% ${(50 + 50 * s * Math.sin(a)).toFixed(2)}%`);
	}
	return `polygon(${pts.join(',')})`;
};
const hexPath = (s: number, R: number) => {
	const pts: string[] = [];
	for (let k = 0; k < 6; k++) {
		const a = ((-90 + k * 60) * Math.PI) / 180;
		pts.push(`${(ZX + R * s * Math.cos(a)).toFixed(1)} ${(ZY + R * s * Math.sin(a)).toFixed(1)}`);
	}
	return `M ${pts.join(' L ')} Z`;
};

const Crystals: React.FC<{t: number}> = ({t}) => {
	const p = cl(t, 8.45, 9.2, 0, 1, OUT);
	const p2 = cl(t, 8.7, 9.45, 0, 1, OUT);
	if (p <= 0) return null;
	const arms: React.ReactNode[] = [];
	for (let k = 0; k < 6; k++) {
		const a = ((-90 + k * 60 + 30) * Math.PI) / 180;
		const L = 820;
		const ex = ZX + Math.cos(a) * L;
		const ey = ZY + Math.sin(a) * L;
		arms.push(<path key={`a${k}`} d={`M ${ZX} ${ZY} L ${ex} ${ey}`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />);
		[0.34, 0.54, 0.74].forEach((f, j) => {
			const bx = ZX + Math.cos(a) * L * f;
			const by = ZY + Math.sin(a) * L * f;
			const len = 190 * (1.15 - f);
			[-1, 1].forEach((sgn) => {
				const b = a + (sgn * 55 * Math.PI) / 180;
				arms.push(
					<path key={`b${k}-${j}-${sgn}`} d={`M ${bx} ${by} L ${bx + Math.cos(b) * len} ${by + Math.sin(b) * len}`} stroke="#ffffff" strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p2} />,
				);
			});
		});
	}
	return (
		<svg style={{...abs(0, 0, WORLD_W, H), overflow: 'visible'}} viewBox={`0 0 ${WORLD_W} ${H}`}>
			<g filter="url(#glowIce)">{arms}</g>
			<path d={hexPath(1, 600)} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.6 * p} transform={`rotate(${t * 12} ${ZX} ${ZY})`} />
		</svg>
	);
};

const ShuangZone: React.FC<{t: number}> = ({t}) => {
	const s = cl(t, 8.55, 9.05, 0, 1, Easing.out(Easing.back(1.3)));
	const S = 880;
	return (
		<>
			{s > 0.002 && (
				<div style={{...abs(ZX - S / 2, ZY - S / 2, S, S), clipPath: hexClip(s)}}>
					<Img src={staticFile('shuang.jpg')} style={{width: S, height: S, objectFit: 'cover', transform: `scale(${1.1 - 0.06 * cl(t, 8.6, 10, 0, 1)})`}} />
				</div>
			)}
		</>
	);
};

const ShuangText: React.FC<{t: number}> = ({t}) => {
	const a = t - 9.26;
	if (a < 0) return null;
	return (
		<>
			<div
				style={{
					position: 'absolute',
					left: 7180,
					top: 480,
					fontFamily: SERIF,
					fontWeight: 900,
					fontSize: 640,
					lineHeight: 1,
					color: '#ffffff',
					textShadow: '22px 22px 0 #6d86ff',
					opacity: cl(a, 0, 0.12, 0, 1),
					transform: `translateY(${cl(a, 0, 0.34, 150, 0, OUTX)}px)`,
					filter: `blur(${cl(a, 0, 0.24, 16, 0)}px)`,
				}}
			>
				霜
			</div>
			<div style={{position: 'absolute', left: 7190, top: 1170, fontFamily: MONO, fontWeight: 700, fontSize: 48, letterSpacing: 12, color: '#24346e', opacity: cl(a, 0.15, 0.35, 0, 1)}}>
				SHUANG　03 / 06
			</div>
		</>
	);
};

export const Sample: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const t = frame / fps;
	const cx = camX(t);
	const vps = (camX(t) - camX(Math.max(0, t - 0.01))) / 0.01;
	const mb = Math.min(52, Math.abs(vps) / 170);
	const zs = 1 + 0.05 * pulse(t, LANDS, 10) + 0.012 * pulse(t, KICKS, 9);
	const burst = t >= 6.8 && t < 7.05 ? cl(t, 6.8, 7.05, 1, 0) : 0;
	const jx = burst ? (random(`jx${frame}`) - 0.5) * 70 * burst : 0;
	const jy = burst ? (random(`jy${frame}`) - 0.5) * 40 * burst : 0;
	const pk = pulse(t, KICKS, 7);

	// 声音线 1：开头波形 → 拐进汐的光环
	const head1 = t < 2.05 ? cx + cl(t, 0, 0.7, -60, 1450, OUT) : cl(t, 2.05, 2.3, camX(2.05) + 1450, HX - HR, INOUT);
	const y1 = (x: number) => {
		const base = x < 2500 ? 720 : cl(x, 2500, HX - HR, 720, HY, Easing.inOut(Easing.sin));
		const k = cl(x, 2350, HX - HR - 60, 1, 0);
		const A = (34 + 180 * pk) * Math.exp(-Math.pow((head1 - x) / 700, 2)) + 14;
		return base + k * (A * Math.sin(x * 0.011 - t * 9) * Math.sin(x * 0.0047 + 1.3) + 9 * Math.sin(x * 0.043 + t * 6));
	};
	const d1 = wavePath(-100, Math.min(head1, HX - HR), y1);
	const op1 = cl(t, 2.7, 3.0, 1, 0);

	// 声音线 2：从光环牵出去 → 甩进潮
	const head2 = cl(t, 4.45, 4.95, HX + HR, 5000, Easing.in(Easing.quad));
	const y2 = (x: number) => cl(x, HX + HR, 5000, HY, 140, INOUT) + 18 * Math.sin(x * 0.02 - t * 10) * cl(x, HX + HR, HX + HR + 200, 0, 1);
	const d2 = t >= 4.45 ? wavePath(HX + HR, head2, y2) : '';
	const op2 = cl(t, 5.0, 5.12, 1, 0);

	// 潮：线变成扫描线
	const scanY = cl(t, 5.0, 6.75, 140, 1330, Easing.inOut(Easing.sin));
	const scanOp = t >= 4.98 ? cl(t, 4.98, 5.05, 0, 1) * cl(t, 6.75, 6.85, 1, 0) : 0;
	const dScan = scanOp > 0 ? wavePath(4560, 6860, (x) => scanY + 6 * Math.sin(x * 0.05 + t * 30) * g2(t), 20) : '';

	// 声音线 3：穿过撕口 → 冰晶中心
	const head3 = cl(t, 8.15, 8.62, TX, ZX, INOUT);
	const d3 = t >= 8.15 ? wavePath(TX, head3, (x) => 720 + cl(x, ZX - 500, ZX, 0, ZY - 720) + 16 * Math.sin(x * 0.018 - t * 9), 12) : '';
	const op3 = cl(t, 9.1, 9.5, 1, 0.35);

	const zone = t < 2.47 ? '' : t < 4.94 ? '01　汐' : t < 8.63 ? '02　潮' : '03　霜';
	const vol = interpolate(frame, [0, 6, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: '#0c0a12', overflow: 'hidden'}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<defs>
					<filter id="mb" x="-5%" y="0%" width="110%" height="100%">
						<feGaussianBlur stdDeviation={`${mb.toFixed(2)} 0`} />
					</filter>
				</defs>
			</svg>
			<AbsoluteFill style={{transform: `scale(${zs}) translate(${jx}px, ${jy}px)`, transformOrigin: '50% 50%'}}>
				<div style={{...abs(0, 0, WORLD_W, H), transform: `translateX(${-cx}px)`, filter: mb > 0.6 ? 'url(#mb)' : undefined}}>
					<Opening t={t} />
					<XiZone t={t} />
					<ChaoZone t={t} />
					<div style={{...abs(6800, 0, 3000, H), background: ICE}} />
					<Tear t={t} />
					<Crystals t={t} />
					<ShuangZone t={t} />
					<svg style={{...abs(0, 0, WORLD_W, H), overflow: 'visible'}} viewBox={`0 0 ${WORLD_W} ${H}`}>
						<defs>
							<filter id="blurL" filterUnits="userSpaceOnUse" x={-200} y={-200} width={WORLD_W + 400} height={H + 400}>
								<feGaussianBlur stdDeviation={16} />
							</filter>
							<filter id="blurS" filterUnits="userSpaceOnUse" x={-200} y={-200} width={WORLD_W + 400} height={H + 400}>
								<feGaussianBlur stdDeviation={5} />
							</filter>
							<filter id="glowStar" filterUnits="userSpaceOnUse" x={0} y={-200} width={WORLD_W} height={H + 400}>
								<feGaussianBlur in="SourceGraphic" stdDeviation={10} result="b" />
								<feFlood floodColor="#ff4f98" result="c" />
								<feComposite in="c" in2="b" operator="in" result="g" />
								<feMerge>
									<feMergeNode in="g" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
							<filter id="glowIce" filterUnits="userSpaceOnUse" x={6000} y={-200} width={3800} height={H + 400}>
								<feGaussianBlur in="SourceGraphic" stdDeviation={9} result="b" />
								<feFlood floodColor="#5f86ff" result="c" />
								<feComposite in="c" in2="b" operator="in" result="g" />
								<feMerge>
									<feMergeNode in="g" />
									<feMergeNode in="g" />
									<feMergeNode in="SourceGraphic" />
								</feMerge>
							</filter>
						</defs>
						<GlowPath d={d1} core="#ffffff" glow="#ffc2dc" w={6} op={op1} />
						<XiFront t={t} />
						<GlowPath d={d2} core="#ffffff" glow="#ff5fa2" w={6} op={op2} />
						<GlowPath d={dScan} core="#111111" glow="#ff3355" w={7} op={scanOp} />
						<GlowPath d={d3} core="#ffffff" glow="#6f9bff" w={6} op={op3} />
						{s3(t) > 0 && <path d={hexPath(s3(t), 455)} fill="none" stroke="#ffffff" strokeWidth={10} />}
						{t > 8.5 &&
							Array.from({length: 46}).map((_, i) => {
								const x = 7040 + random(`snx${i}`) * 2050;
								const y = ((random(`sny${i}`) * 1500 + (t - 8.4) * (90 + random(`snv${i}`) * 140)) % 1500) - 30;
								return <circle key={i} cx={x} cy={y} r={3 + random(`snr${i}`) * 6} fill="#ffffff" opacity={cl(t, 8.5, 8.9, 0, 0.85)} />;
							})}
					</svg>
					<XiText t={t} />
					<ChaoText t={t} />
					<ShuangText t={t} />
				</div>
			</AbsoluteFill>

			{/* 界面角标：差值混合，自动在亮底暗底上都看得清 */}
			<AbsoluteFill style={{mixBlendMode: 'difference', pointerEvents: 'none'}}>
				<div style={{position: 'absolute', left: 64, top: 52, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 14, color: '#fff'}}>她们，和澪</div>
				<div style={{position: 'absolute', right: 64, top: 52, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: '#fff'}}>{zone}</div>
				<div style={{position: 'absolute', left: 64, bottom: 52, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: '#fff'}}>{(MUSIC_START + t).toFixed(2)}</div>
				<div style={{position: 'absolute', right: 64, bottom: 60, display: 'flex', gap: 8}}>
					{KICKS.slice(0, 16).map((k, i) => (
						<div key={i} style={{width: 18, height: t >= k ? 6 + 18 * pulse(t, [k], 10) : 6, background: '#fff', opacity: t >= k ? 1 : 0.3, alignSelf: 'flex-end'}} />
					))}
				</div>
			</AbsoluteFill>

			<AbsoluteFill style={{background: '#ffffff', opacity: 0.5 * pulse(t, LANDS, 16)}} />
			{t >= 6.8 && t < 6.87 && <AbsoluteFill style={{background: '#ffffff', mixBlendMode: 'difference'}} />}
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile('noise.png')})`,
					backgroundPosition: `${Math.floor(random(`gx${frame}`) * 512)}px ${Math.floor(random(`gy${frame}`) * 512)}px`,
					mixBlendMode: 'overlay',
					opacity: 0.2,
				}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 58%, rgba(0,0,0,0.34) 100%)'}} />
			<Audio src={staticFile('bgm.mp3')} trimBefore={Math.round(MUSIC_START * fps)} volume={vol} />
		</AbsoluteFill>
	);
};

function g2(t: number) {
	return Math.max(pulse(t, [5.55, 6.17], 12), 0.15);
}
function s3(t: number) {
	return cl(t, 8.55, 9.05, 0, 1, Easing.out(Easing.back(1.3)));
}
