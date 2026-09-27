import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export type MioRemotionDemoProps = {
  kicker: string;
  title: string;
  subtitle: string;
  accent: string;
};

const GridBackground: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#05091F',
        overflow: 'hidden',
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.46,
          backgroundImage:
            'linear-gradient(rgba(120,146,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(120,146,255,0.16) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          translate: `${interpolate(frame, [0, 300], [-20, 18])}px ${interpolate(
            frame,
            [0, 300],
            [-10, 22],
          )}px`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 820,
          height: 820,
          left: -280,
          top: -170,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,68,255,0.42), rgba(74,68,255,0))',
          scale: interpolate(frame, [0, 150, 300], [0.94, 1.08, 0.98]),
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 650,
          height: 650,
          right: -250,
          bottom: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}2D, ${accent}00)`,
          translate: `0px ${interpolate(frame, [0, 300], [80, -40])}px`,
        }}
      />
      {[
        [94, 188],
        [836, 146],
        [720, 438],
        [162, 612],
        [950, 842],
        [310, 1010],
        [820, 1220],
        [132, 1490],
        [912, 1690],
        [510, 1780],
      ].map(([left, top], index) => (
        <div
          key={`${left}-${top}`}
          style={{
            position: 'absolute',
            left,
            top,
            width: index % 3 === 0 ? 8 : 5,
            height: index % 3 === 0 ? 8 : 5,
            borderRadius: '50%',
            backgroundColor: index % 2 === 0 ? accent : '#93A9FF',
            opacity: interpolate(frame, [index * 3, index * 3 + 20], [0.18, 0.7], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Corner: React.FC<{x: 'left' | 'right'; y: 'top' | 'bottom'; accent: string}> = ({
  x,
  y,
  accent,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        [x]: -13,
        [y]: -13,
        width: 28,
        height: 28,
        backgroundColor: '#07102B',
        border: `4px solid ${accent}`,
        boxShadow: '0 0 0 3px rgba(5,9,31,0.84)',
      }}
    />
  );
};

const SceneOne: React.FC<MioRemotionDemoProps> = ({kicker, title, subtitle, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 18, stiffness: 120, mass: 0.8}});

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 12, 82, 105], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        padding: '260px 88px 180px',
      }}
    >
      <div
        style={{
          color: '#A9B5E6',
          fontFamily: 'Arial, sans-serif',
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 7,
          opacity: interpolate(frame, [6, 22], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          translate: `${interpolate(frame, [6, 22], [-36, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })}px 0px`,
        }}
      >
        MIO / REMOTION LAB
      </div>

      <div
        style={{
          position: 'relative',
          marginTop: 128,
          border: `3px solid ${accent}`,
          minHeight: 620,
          padding: '78px 48px 72px',
          boxShadow: `0 0 46px ${accent}18`,
          scale: 0.9 + entrance * 0.1,
          opacity: entrance,
        }}
      >
        <Corner x="left" y="top" accent={accent} />
        <Corner x="right" y="top" accent={accent} />
        <Corner x="left" y="bottom" accent={accent} />
        <Corner x="right" y="bottom" accent={accent} />

        <div
          style={{
            display: 'inline-block',
            color: '#FFFFFF',
            fontFamily: 'Arial, sans-serif',
            fontSize: 76,
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: -4,
            padding: '12px 24px 16px',
            background: 'linear-gradient(90deg, #5325B8, #8957FF)',
            translate: `${interpolate(frame, [4, 24], [-100, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px 0px`,
          }}
        >
          {kicker}
        </div>

        <div
          style={{
            marginTop: 66,
            color: '#FFFFFF',
            fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
            fontSize: 118,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: -7,
            opacity: interpolate(frame, [16, 34], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: `0px ${interpolate(frame, [16, 34], [76, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            })}px`,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 50,
            width: 720,
            color: '#B9C5F0',
            fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
            fontSize: 42,
            lineHeight: 1.55,
            fontWeight: 600,
            opacity: interpolate(frame, [30, 48], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {subtitle}
        </div>

        <div
          style={{
            position: 'absolute',
            right: 38,
            top: 34,
            padding: '12px 19px',
            borderRadius: 999,
            backgroundColor: accent,
            color: '#061021',
            fontFamily: 'Arial, sans-serif',
            fontSize: 23,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          REACT × VIDEO
        </div>
      </div>

      <div
        style={{
          marginTop: 126,
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          color: '#FFFFFF',
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
          fontSize: 34,
          fontWeight: 800,
          opacity: interpolate(frame, [44, 62], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div style={{width: 76, height: 4, backgroundColor: accent}} />
        每一个动作，都对应确定的帧
      </div>
    </AbsoluteFill>
  );
};

const SceneTwo: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame, fps, config: {damping: 20, stiffness: 105}});
  const displayedFrame = Math.min(299, 90 + frame);

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 16, 92, 120], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        padding: '210px 84px 170px',
      }}
    >
      <div
        style={{
          color: accent,
          fontFamily: 'Arial, sans-serif',
          fontSize: 28,
          fontWeight: 900,
          letterSpacing: 8,
        }}
      >
        FRAME ACCURATE
      </div>
      <div
        style={{
          marginTop: 38,
          color: '#FFFFFF',
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
          fontSize: 124,
          lineHeight: 1.03,
          fontWeight: 900,
          letterSpacing: -8,
          translate: `0px ${(1 - rise) * 90}px`,
          opacity: rise,
        }}
      >
        精确到
        <br />
        每一帧
      </div>

      <div
        style={{
          marginTop: 116,
          padding: '58px 46px 52px',
          border: '2px solid rgba(145,164,255,0.42)',
          backgroundColor: 'rgba(10,18,58,0.78)',
          boxShadow: '0 30px 100px rgba(0,0,0,0.32)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            color: '#8FA2E8',
            fontFamily: 'monospace',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 3,
          }}
        >
          <span>CURRENT FRAME</span>
          <span>30 FPS</span>
        </div>
        <div
          style={{
            marginTop: 28,
            color: '#FFFFFF',
            fontFamily: 'monospace',
            fontSize: 132,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: -8,
          }}
        >
          {String(displayedFrame).padStart(4, '0')}
        </div>

        <div style={{marginTop: 62, display: 'grid', gap: 22}}>
          {[
            ['TITLE', 0.82, '#8957FF'],
            ['SUBTITLE', 0.62, accent],
            ['BACKGROUND', 0.94, '#4665FF'],
          ].map(([label, length, color], index) => (
            <div key={label} style={{display: 'grid', gridTemplateColumns: '170px 1fr', gap: 20}}>
              <div
                style={{
                  color: '#AFBBE7',
                  fontFamily: 'monospace',
                  fontSize: 21,
                  fontWeight: 700,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  height: 20,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Number(length) * 100}%`,
                    backgroundColor: String(color),
                    scale: `${interpolate(frame, [10 + index * 5, 40 + index * 5], [0, 1], {
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                    })} 1`,
                    transformOrigin: 'left center',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 92,
          color: '#C7D0F5',
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
          fontSize: 42,
          lineHeight: 1.55,
          fontWeight: 600,
        }}
      >
        动画不靠“差不多”，而是由数字决定何时出现、移动多远、在哪一帧结束。
      </div>
    </AbsoluteFill>
  );
};

const SceneThree: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, 14, 82, 105], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        padding: '190px 84px 150px',
      }}
    >
      <div
        style={{
          color: '#FFFFFF',
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
          fontSize: 112,
          lineHeight: 1.06,
          fontWeight: 900,
          letterSpacing: -7,
          opacity: spring({frame, fps, config: {damping: 18, stiffness: 120}}),
          scale: 0.84 + spring({frame, fps, config: {damping: 18, stiffness: 120}}) * 0.16,
          transformOrigin: 'left top',
        }}
      >
        以后你只要说
      </div>

      <div style={{marginTop: 100, display: 'grid', gap: 30}}>
        {[
          ['01', '做成 9:16 竖屏'],
          ['02', '歌词跟着鼓点走'],
          ['03', '把颜色和文字换掉'],
        ].map(([number, text], index) => (
          <div
            key={number}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1fr',
              alignItems: 'center',
              gap: 26,
              padding: '38px 34px',
              border: `2px solid ${index === 1 ? accent : 'rgba(139,158,234,0.36)'}`,
              backgroundColor: index === 1 ? `${accent}12` : 'rgba(8,16,50,0.72)',
              opacity: interpolate(frame, [12 + index * 8, 30 + index * 8], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
              translate: `${interpolate(frame, [12 + index * 8, 30 + index * 8], [90, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              })}px 0px`,
            }}
          >
            <div
              style={{
                color: index === 1 ? '#071021' : '#8FA2E8',
                backgroundColor: index === 1 ? accent : 'rgba(99,119,219,0.16)',
                width: 76,
                height: 76,
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'monospace',
                fontSize: 25,
                fontWeight: 900,
              }}
            >
              {number}
            </div>
            <div
              style={{
                color: '#FFFFFF',
                fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
                fontSize: 48,
                fontWeight: 800,
              }}
            >
              {text}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 116,
          paddingTop: 54,
          borderTop: '2px solid rgba(143,162,232,0.3)',
          color: '#C6D0F7',
          fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", "PingFang SC", Arial, sans-serif',
          fontSize: 42,
          lineHeight: 1.55,
          fontWeight: 600,
          opacity: interpolate(frame, [50, 68], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        我改代码，Remotion 重新出片。
        <br />
        同一套模板可以一直复用。
      </div>

      <div
        style={{
          position: 'absolute',
          left: 84,
          right: 84,
          bottom: 138,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#FFFFFF',
          fontFamily: 'monospace',
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: 3,
        }}
      >
        <span>MIO REMOTION LAB</span>
        <span style={{color: accent}}>READY TO RENDER</span>
      </div>
    </AbsoluteFill>
  );
};

export const MioRemotionDemo: React.FC<MioRemotionDemoProps> = (props) => {
  return (
    <AbsoluteFill>
      <GridBackground accent={props.accent} />
      <Sequence from={0} durationInFrames={105} name="01 - 代码就是时间轴">
        <SceneOne {...props} />
      </Sequence>
      <Sequence from={90} durationInFrames={120} name="02 - 精确到每一帧">
        <SceneTwo accent={props.accent} />
      </Sequence>
      <Sequence from={195} durationInFrames={105} name="03 - 以后你只要说">
        <SceneThree accent={props.accent} />
      </Sequence>
    </AbsoluteFill>
  );
};
