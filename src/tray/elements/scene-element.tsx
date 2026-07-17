import React from 'react';
import clsx from 'clsx';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { SceneAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface SceneElementProps {
  state: IState<SceneAttributes>
  entity: IEntityConfig
  refetch: () => void
}

export default function SceneElement(props: SceneElementProps) {
  const { state, entity, refetch } = props;
  const { systemAttributes: { computedOsTheme } } = useSettings();

  return (
    <button
      type="button"
      className={clsx(
        'flex h-[50px] w-full items-center px-3',
        'hover:bg-action-hover',
        {
          'pointer-events-none opacity-50': state.state === 'unavailable',
          'rounded-lg': computedOsTheme === 'win11',
        },
      )}
      onClick={async () => {
        await window.electronAPI.state.callServiceAction('scene', 'turn_on', { entity_id: entity.entity_id });
        await refetch();
      }}
    >
      <div className="w-10">
        <ElementIcon iconName={entity.icon || state.attributes.icon || 'mdi:palette'} />
      </div>
      <h2>
        {EntityUtils.getEntityName(entity, state)}
      </h2>
    </button>
  );
}
