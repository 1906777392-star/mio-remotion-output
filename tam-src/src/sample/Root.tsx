import React from 'react';
import {Composition} from 'remotion';
import {Sample} from './Sample';
export const SampleRoot: React.FC = () => (
	<Composition id="TheyAndMio-Sample" component={Sample} durationInFrames={300} fps={30} width={1920} height={1440} />
);
