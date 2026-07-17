import React, { useEffect, useState } from 'react';
import Icon from '@mdi/react';
import { mdiFan } from '@mdi/js';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useDebouncedCallback } from 'use-debounce';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { FanAttributes } from '../../types/state';
import { sendHeight } from '../send-height';
import './slider.css';
import ElementIcon from './element-icon';

interface FanElementProps {
  state: IState<FanAttributes>
  entity: IEntityConfig
  refetch: () => void
}

export default function FanElement(props: FanElementProps) {
  const { state, entity, refetch } = props;
  const { systemAttributes: { computedOsTheme } } = useSettings();

  const supportsPercentage = state.attributes.percentage !== undefined && state.attributes.percentage !== null;

  const [expanded, setExpanded] = useState<boolean>(false);
  const [percentage, setPercentage] = useState<number>(Math.round(state.attributes.percentage ?? 0));

  useEffect(() => {
    setPercentage(Math.round(state.attributes.percentage ?? 0));
  }, [state]);

  useEffect(() => {
    sendHeight();
  }, [expanded]);

  const debouncedSave = useDebouncedCallback(async (newPercentage: number) => {
    await window.electronAPI.state.callServiceAction('fan', 'set_percentage', { entity_id: entity.entity_id, percentage: newPercentage });
    await refetch();
  }, 500);

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = Math.round(event.target.valueAsNumber);
    setPercentage(value);
    debouncedSave(value);
  };

  const onWheel: React.WheelEventHandler = (event) => {
    const step = state.attributes.percentage_step || 1;
    const scrollChange = (event.deltaY / 50) * -1 * step;
    const value = Math.round(Math.min(Math.max(percentage + scrollChange, 0), 100));
    setPercentage(value);
    debouncedSave(value);
  };

  return (
    <div className={clsx({ 'pointer-events-none opacity-50': state.state === 'unavailable' })}>
      <div className={clsx(
        'flex h-[50px] w-full items-center hover:bg-action-hover',
        { 'rounded-lg': computedOsTheme === 'win11' },
      )}
      >
        <button
          type="button"
          className={clsx(
            'box-content h-full w-7 px-3 hover:bg-action-hover',
            { 'rounded-lg': computedOsTheme === 'win11', 'text-accent-main': state.state === 'on' },
          )}
          onClick={async () => {
            await window.electronAPI.state.callServiceAction('fan', 'toggle', { entity_id: entity.entity_id });
            await refetch();
          }}
        >
          <ElementIcon iconName={EntityUtils.getIconName(entity, state)} />
        </button>

        <h2>
          {EntityUtils.getEntityName(entity, state)}
        </h2>

        <div className="grow" />

        {supportsPercentage && (
          <>
            <button
              type="button"
              className="mr-1 rounded-full bg-text-primary/[.15] px-3 py-[6px] text-sm font-medium leading-none hover:bg-text-primary/[.3]"
              onClick={() => setExpanded(!expanded)}
            >
              {`${percentage}%`}
            </button>
            <button type="button" className="h-full pl-1 pr-3" onClick={() => setExpanded(!expanded)}>
              <div className={clsx(!expanded && 'rotate-180')}>
                <ExpandLessIcon />
              </div>
            </button>
          </>
        )}

        {!supportsPercentage && <div className="w-3" />}
      </div>

      {expanded && supportsPercentage && (
        <div className="px-3 py-2" onWheel={onWheel}>
          <div className="flex w-full items-center">
            <button className="appearance-none pl-2 pr-4" type="button">
              <Icon path={mdiFan} size={0.8} />
            </button>
            <div className="custom-slider relative h-[36px] grow">
              <input
                className="group h-full w-full appearance-none bg-transparent"
                type="range"
                min={0}
                max={100}
                value={percentage}
                onChange={onChange}
              />
              <div className="pointer-events-none absolute top-[calc(50%-1px)] h-[2px] bg-accent-main" style={{ width: `${percentage}%` }} />
            </div>
            <h2 className="-mr-1 w-[52px] pl-2 text-center text-xl">{percentage}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
