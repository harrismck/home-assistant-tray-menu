import React, { useState } from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { ButtonAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface ButtonElementProps {
  state: IState<ButtonAttributes>
  entity: IEntityConfig
  refetch: () => void
}

// Momentary trigger for button / input_button / script entities. A single click
// fires the entity's action; there is no persistent on/off state to reflect.
export default function ButtonElement(props: ButtonElementProps) {
  const { state, entity, refetch } = props;
  const { systemAttributes: { computedOsTheme } } = useSettings();
  const [triggered, setTriggered] = useState<boolean>(false);

  const onClick = async () => {
    const [domain] = entity.entity_id.split('.');
    // Scripts are started with script.turn_on; buttons/input_buttons use *.press.
    const service = domain === 'script' ? 'turn_on' : 'press';

    // Brief visual feedback since the state itself does not change.
    setTriggered(true);
    setTimeout(() => setTriggered(false), 600);

    await window.electronAPI.state.callServiceAction(domain, service, { entity_id: entity.entity_id });
    await refetch();
  };

  return (
    <button
      type="button"
      className={twMerge(clsx(
        'flex h-[50px] w-full items-center px-3 transition-colors',
        'hover:bg-action-hover',
        {
          'bg-accent-main text-accent-mainContrastText': triggered,
          'pointer-events-none opacity-50': state.state === 'unavailable',
          'rounded-lg': computedOsTheme === 'win11',
        },
      ))}
      onClick={onClick}
    >
      <div className="w-10">
        <ElementIcon iconName={EntityUtils.getIconName(entity, state)} />
      </div>
      <h2>
        {EntityUtils.getEntityName(entity, state)}
      </h2>
    </button>
  );
}
