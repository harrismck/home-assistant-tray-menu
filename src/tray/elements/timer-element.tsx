import React, { useEffect, useState } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { TimerAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface TimerElementProps {
  state: IState<TimerAttributes>
  entity: IEntityConfig
  refetch: () => void
}

// Format a number of seconds as H:MM:SS (or M:SS when under an hour).
function formatSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${ss}`;
  }
  return `${minutes}:${ss}`;
}

// Parse an HA duration string ("H:MM:SS") into seconds.
function parseDuration(duration: string | undefined): number {
  if (!duration) {
    return 0;
  }
  const parts = duration.split(':').map(Number);
  if (parts.some(Number.isNaN)) {
    return 0;
  }
  return parts.reduce((acc, part) => acc * 60 + part, 0);
}

export default function TimerElement(props: TimerElementProps) {
  const { state, entity, refetch } = props;
  const { systemAttributes: { computedOsTheme } } = useSettings();

  const isActive = state.state === 'active';
  const isPaused = state.state === 'paused';

  const [remaining, setRemaining] = useState<number>(parseDuration(state.attributes.remaining));

  // While active, tick a live countdown off finishes_at; otherwise mirror server value.
  useEffect(() => {
    if (isActive && state.attributes.finishes_at) {
      const finishesAt = new Date(state.attributes.finishes_at).getTime();
      const tick = () => setRemaining((finishesAt - Date.now()) / 1000);
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    }
    setRemaining(parseDuration(state.attributes.remaining));
    return undefined;
  }, [state, isActive]);

  const callTimer = async (service: string) => {
    await window.electronAPI.state.callServiceAction('timer', service, { entity_id: entity.entity_id });
    await refetch();
  };

  const displaySeconds = isActive || isPaused ? remaining : parseDuration(state.attributes.duration);

  return (
    <div className={clsx(
      'flex h-[50px] w-full items-center px-3',
      {
        'rounded-lg': computedOsTheme === 'win11',
        'pointer-events-none opacity-50': state.state === 'unavailable',
      },
    )}
    >
      <div className="w-10">
        <ElementIcon iconName={EntityUtils.getIconName(entity, state)} />
      </div>
      <div className="flex flex-1 flex-col items-start">
        <h2 className="text-sm font-medium">
          {EntityUtils.getEntityName(entity, state)}
        </h2>
        <div className={clsx('text-xs tabular-nums', isActive ? 'text-accent-main' : 'opacity-70')}>
          {formatSeconds(displaySeconds)}
          {isPaused && ' (paused)'}
        </div>
      </div>

      <button
        type="button"
        className="h-full px-1 text-icon-main hover:text-icon-hover"
        onClick={() => callTimer(isActive ? 'pause' : 'start')}
      >
        {isActive ? <PauseIcon /> : <PlayArrowIcon />}
      </button>

      {(isActive || isPaused) && (
        <button
          type="button"
          className="h-full px-1 text-icon-main hover:text-icon-hover"
          onClick={() => callTimer('cancel')}
        >
          <StopIcon />
        </button>
      )}
    </div>
  );
}
