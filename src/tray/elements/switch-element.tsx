import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSettings } from '../../utils/use-settings';
import { IEntityConfig } from '../../store';
import EntityUtils from '../../utils/entity-utils';
import IState, { SwitchAttributes } from '../../types/state';
import ElementIcon from './element-icon';

interface SwitchElementProps {
  state: IState<SwitchAttributes>
  entity: IEntityConfig
  refetch: () => void
}

export default function SwitchElement(props: SwitchElementProps) {
  const { state, entity, refetch } = props;
  const { systemAttributes: { computedOsTheme } } = useSettings();

  return (
    <button
      type="button"
      className={twMerge(clsx(
        'flex h-[50px] w-full items-center px-3',
        'hover:bg-action-hover',
        {
          'bg-accent-main text-accent-mainContrastText hover:bg-accent-main/70': state?.state === 'on',
          'pointer-events-none opacity-50': state.state === 'unavailable',
          'rounded-lg': computedOsTheme === 'win11',
        },
      ))}
      onClick={async () => {
        // Derive the domain from the entity so on/off lights (routed here from
        // LightElement) toggle via light.toggle, while real switches use switch.toggle.
        const [domain] = entity.entity_id.split('.');
        await window.electronAPI.state.callServiceAction(domain, 'toggle', { entity_id: entity.entity_id });
        await refetch();
      }}
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
