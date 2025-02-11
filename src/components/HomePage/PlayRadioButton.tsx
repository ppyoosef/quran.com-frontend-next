/* eslint-disable react/no-multi-comp */
import { useContext } from 'react';

import { useSelector } from '@xstate/react';
import useTranslation from 'next-translate/useTranslation';

import Spinner from '../dls/Spinner/Spinner';
import { getRandomCuratedStationId } from '../Radio/curatedStations';
import { StationType } from '../Radio/types';

import styles from './PlayRadioButton.module.scss';
import RadioInformation from './RadioInformation';

import Button, { ButtonVariant, ButtonType, ButtonSize } from '@/dls/Button/Button';
import PauseIcon from '@/icons/pause.svg';
import PlayIcon from '@/icons/play-arrow.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getCoursesNavigationUrl } from '@/utils/navigation';
import { selectIsLoading } from 'src/xstate/actors/audioPlayer/selectors';
import { AudioPlayerMachineContext } from 'src/xstate/AudioPlayerMachineContext';

const PlayRadioButton = () => {
  const { t } = useTranslation('radio');
  const audioService = useContext(AudioPlayerMachineContext);

  const isAudioPlaying = useSelector(audioService, (state) =>
    state.matches('VISIBLE.AUDIO_PLAYER_INITIATED.PLAYING'),
  );
  const isRadioMode = useSelector(audioService, (state) => !!state.context.radioActor);
  const isLoading = useSelector(audioService, selectIsLoading);

  const onCoursesClicked = () => {
    logButtonClick('homepage_courses_cta');
  };

  // TODO: handle continue radio from last saved session
  const onPlayClicked = () => {
    if (isRadioMode) {
      audioService.send('TOGGLE');
      return;
    }
    const randomStationId = getRandomCuratedStationId();

    logButtonClick('play_radio', {
      stationId: randomStationId,
      type: StationType.Curated,
    });

    audioService.send({
      type: 'PLAY_RADIO',
      stationId: Number(randomStationId),
      stationType: StationType.Curated,
    });
  };

  const onPauseClicked = () => {
    audioService.send('TOGGLE');
  };

  const { radioActor } = audioService.getSnapshot().context;
  return (
    <div className={styles.container}>
      <Button
        href={getCoursesNavigationUrl()}
        variant={ButtonVariant.Outlined}
        className={styles.ctaButton}
        size={ButtonSize.Small}
        type={ButtonType.Secondary}
        onClick={onCoursesClicked}
      >
        {t('common:learning-plans')}
      </Button>
      <div className={styles.playRadioSection}>
        {isAudioPlaying && isRadioMode ? (
          <Button
            prefix={isLoading ? <Spinner /> : <PauseIcon />}
            onClick={onPauseClicked}
            className={styles.playPauseButton}
          >
            {t('pause-radio')}
          </Button>
        ) : (
          <Button
            prefix={<PlayIcon />}
            className={styles.playPauseButton}
            onClick={onPlayClicked}
            shouldFlipOnRTL={false}
          >
            {t('play-radio')}
          </Button>
        )}
        {radioActor && <RadioInformation radioActor={radioActor} />}
      </div>
    </div>
  );
};

export default PlayRadioButton;
