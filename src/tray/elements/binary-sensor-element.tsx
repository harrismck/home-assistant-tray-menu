import React from 'react';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { BinarySensorAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface BinarySensorElementProps {
  state: IState<BinarySensorAttributes>
  entity: IEntityConfig
}

// Human-friendly on/off wording per device_class (falls back to On/Off).
const STATE_LABELS: Record<string, { on: string, off: string }> = {
  motion: { on: 'Detected', off: 'Clear' },
  occupancy: { on: 'Detected', off: 'Clear' },
  presence: { on: 'Home', off: 'Away' },
  door: { on: 'Open', off: 'Closed' },
  window: { on: 'Open', off: 'Closed' },
  garage_door: { on: 'Open', off: 'Closed' },
  opening: { on: 'Open', off: 'Closed' },
  lock: { on: 'Unlocked', off: 'Locked' },
  moisture: { on: 'Wet', off: 'Dry' },
  smoke: { on: 'Detected', off: 'Clear' },
  gas: { on: 'Detected', off: 'Clear' },
  connectivity: { on: 'Connected', off: 'Disconnected' },
  battery: { on: 'Low', off: 'Normal' },
  problem: { on: 'Problem', off: 'OK' },
};

export default function BinarySensorElement(props: BinarySensorElementProps) {
  const { state, entity } = props;
  const { settings, systemAttributes: { computedOsTheme } } = useSettings();

  const isOn = state.state === 'on';
  const deviceClass = state.attributes.device_class ?? '';
  const labels = STATE_LABELS[deviceClass] ?? { on: 'On', off: 'Off' };
  const label = isOn ? labels.on : labels.off;

  return (
    <div className={
      clsx(
        'flex min-h-[68px] flex-col items-center justify-center gap-[2px] bg-text-primary/[.04] px-1 py-2',
        {
          'shadow-[0px_0px_0_1px_var(--tray-border)]': computedOsTheme === 'win10',
          'rounded-[8px]': computedOsTheme === 'win11',
        },
      )
    }
    >
      <div className={clsx(isOn && 'text-accent-main')}>
        <ElementIcon iconName={EntityUtils.getIconName(entity, state)} />
      </div>
      <p className={clsx(
        'break-words text-center font-medium leading-none',
        label.length > 8 ? 'text-xs' : 'text-sm',
        isOn ? 'text-accent-main' : 'opacity-80',
      )}
      >
        {label}
      </p>
      {settings.general.showSensorLabels && (
        <p className="line-clamp-2 w-full text-center text-[.6rem] leading-tight opacity-70">
          {EntityUtils.getEntityName(entity, state)}
        </p>
      )}
    </div>
  );
}
