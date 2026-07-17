import React, { useEffect, useState } from 'react';
import Icon from '@mdi/react';
import { mdiTuneVariant } from '@mdi/js';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { NumberAttributes } from '../../types/state';
import { sendHeight } from '../send-height';
import './slider.css';
import ElementIcon from './element-icon';

interface NumberElementProps {
  state: IState<NumberAttributes>
  entity: IEntityConfig
  refetch: () => void
}

export default function NumberElement(props: NumberElementProps) {
  const { state, entity, refetch } = props;

  const { systemAttributes: { computedOsTheme } } = useSettings();
  const [expanded, setExpanded] = useState<boolean>(false);
  const [value, setValue] = useState<number>(Number(state.state) || 0);

  // reinitialize with new data from the server
  useEffect(() => {
    setValue(Number(state.state) || 0);
  }, [state]);

  // Update height after every render
  useEffect(() => {
    sendHeight();
  }, [expanded]);

  const debouncedSave = useDebouncedCallback(async (newValue: number) => {
    await window.electronAPI.state.callServiceAction('number', 'set_value', { entity_id: entity.entity_id, value: newValue });
    await refetch();
  }, 500);

  const min = state.attributes.min ?? 0;
  const max = state.attributes.max ?? 100;
  const step = state.attributes.step ?? 1;
  const unit = state.attributes.unit_of_measurement ?? '';

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const newValue = event.target.valueAsNumber;
    setValue(newValue);
    debouncedSave(newValue);
  };

  const onWheel: React.WheelEventHandler = (event) => {
    const scrollChange = (event.deltaY / 100) * -1;
    const newValue = Math.min(Math.max(value + (scrollChange * step), min), max);
    setValue(newValue);
    debouncedSave(newValue);
  };

  return (
    <div className={clsx({
      'pointer-events-none opacity-50': state.state === 'unavailable',
    })}
    >
      <button
        className={clsx(
          'flex h-[50px] w-full items-center px-3 hover:bg-action-hover',
          {
            'rounded-lg': computedOsTheme === 'win11',
          },
        )}
        type="button"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10">
          <ElementIcon iconName={entity.icon || state.attributes.icon || 'mdi:tune-variant'} />
        </div>
        <h2 className="flex gap-1">
          {EntityUtils.getEntityName(entity, state)}
        </h2>
        <div className="grow" />
        <div className="mr-1 rounded-full bg-text-primary/[.15] px-3 py-[6px] text-sm font-medium leading-none">
          {`${value}${unit ? ` ${unit}` : ''}`}
        </div>
        <div className={clsx(!expanded && 'rotate-180')}>
          <ExpandLessIcon />
        </div>
      </button>
      {expanded && state.state !== 'unavailable' && (
        <div className="px-3 py-2" onWheel={onWheel}>
          <div className="flex w-full items-center">
            <button className="appearance-none pl-2 pr-4" type="button">
              <Icon path={mdiTuneVariant} size={0.8} />
            </button>
            <div className="custom-slider relative h-[36px] grow">
              <input
                className="group h-full w-full appearance-none bg-transparent"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
              />
              <div className="pointer-events-none absolute top-[calc(50%-1px)] h-[2px] bg-accent-main" style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
            </div>
            <h2 className="-mr-1 w-[52px] pl-2 text-center text-xl">{value}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
