import {Composition} from 'remotion';
import {MioRemotionDemo} from './MioRemotionDemo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MioRemotionDemo"
      component={MioRemotionDemo}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        kicker: 'PART. 01',
        title: '代码就是时间轴',
        subtitle: '改文字、动画和数据，就能重新生成一条视频。',
        accent: '#B9FF38',
      }}
    />
  );
};
