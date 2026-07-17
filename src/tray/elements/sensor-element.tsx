import React from 'react';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { SensorAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface SensorElementProps {
  state: IState<SensorAttributes>
  entity: IEntityConfig
}

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// Compact known device classes (timestamps/dates) so they fit the small card.
function formatSensorValue(state: IState<SensorAttributes>): string {
  const raw = state.state;
  const deviceClass = state.attributes.device_class;

  if (deviceClass === 'date') {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    }
  }

  if (deviceClass === 'timestamp' || ISO_DATETIME_RE.test(raw)) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    }
  }

  return raw;
}

// Shrink the value text as it grows so long strings stay inside the card.
function valueSizeClass(value: string): string {
  const { length } = value;
  if (length <= 5) return 'text-lg';
  if (length <= 9) return 'text-sm';
  if (length <= 16) return 'text-xs';
  return 'text-[.6rem]';
}

export default function SensorElement(props: SensorElementProps) {
  const { state, entity } = props;
  const { settings, systemAttributes: { computedOsTheme } } = useSettings();

  const value = formatSensorValue(state);
  const unit = state.attributes.unit_of_measurement;

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
      <ElementIcon iconName={EntityUtils.getIconName(entity, state)} />
      <div className="flex items-baseline gap-[2px]">
        <p className={clsx('break-words text-center font-medium leading-none', valueSizeClass(value))}>
          {value}
        </p>
        {unit && <span className="align-top text-[.65rem] font-normal leading-none">{unit}</span>}
      </div>
      {settings.general.showSensorLabels && (
        <p className="line-clamp-2 w-full text-center text-[.6rem] leading-tight opacity-70">
          {EntityUtils.getEntityName(entity, state)}
        </p>
      )}
    </div>
  );
}
