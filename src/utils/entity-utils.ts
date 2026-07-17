import IState, {
  InputBooleanAttributes, InputSelectAttributes, LightAttributes, NumberAttributes,
  SceneAttributes, SelectAttributes, SensorAttributes, SwitchAttributes, ThermostatAttributes,
} from '../types/state';
import { IEntityConfig } from '../store';

// Sensible fallback icons per domain, roughly matching Home Assistant's own defaults.
const DOMAIN_ICONS: Record<string, string> = {
  light: 'mdi:lightbulb',
  switch: 'mdi:toggle-switch-variant',
  sensor: 'mdi:eye',
  binary_sensor: 'mdi:radiobox-blank',
  climate: 'mdi:thermostat',
  scene: 'mdi:palette',
  input_boolean: 'mdi:toggle-switch-variant',
  input_select: 'mdi:format-list-bulleted',
  select: 'mdi:format-list-bulleted',
  number: 'mdi:tune-variant',
  fan: 'mdi:fan',
  media_player: 'mdi:cast',
  automation: 'mdi:robot',
  button: 'mdi:gesture-tap-button',
  input_button: 'mdi:gesture-tap-button',
  script: 'mdi:script-text',
  cover: 'mdi:window-shutter',
  lock: 'mdi:lock',
};

// More specific fallbacks for sensors/binary_sensors, keyed by device_class.
const DEVICE_CLASS_ICONS: Record<string, string> = {
  temperature: 'mdi:thermometer',
  humidity: 'mdi:water-percent',
  timestamp: 'mdi:clock-outline',
  date: 'mdi:calendar',
  power: 'mdi:flash',
  energy: 'mdi:lightning-bolt',
  battery: 'mdi:battery',
  pressure: 'mdi:gauge',
  voltage: 'mdi:sine-wave',
  current: 'mdi:current-ac',
  illuminance: 'mdi:brightness-5',
  carbon_dioxide: 'mdi:molecule-co2',
  motion: 'mdi:motion-sensor',
  opening: 'mdi:door',
};

export default class EntityUtils {
  public static getEntityName(entity: IEntityConfig, state: IState | null): string {
    if (entity.label) {
      return entity.label;
    }

    if (state?.attributes.friendly_name) {
      return state.attributes.friendly_name;
    }

    return entity.entity_id;
  }

  // Resolve the icon to display: explicit config icon > HA-provided icon > sensible default.
  public static getIconName(entity: IEntityConfig, state: IState | null): string | undefined {
    if (entity.icon) {
      return entity.icon;
    }

    if (state?.attributes.icon) {
      return state.attributes.icon;
    }

    if (!state) {
      return undefined;
    }

    const [domain] = state.entity_id.split('.');

    if (domain === 'sensor' || domain === 'binary_sensor') {
      const { device_class: deviceClass } = state.attributes as SensorAttributes;
      if (deviceClass && DEVICE_CLASS_ICONS[deviceClass]) {
        return DEVICE_CLASS_ICONS[deviceClass];
      }
    }

    return DOMAIN_ICONS[domain] ?? 'mdi:help-circle-outline';
  }

  public static getState(entity: IEntityConfig, states: IState[]): IState | null {
    const foundState = states.find((state) => state.entity_id === entity.entity_id);

    if (foundState) {
      return foundState;
    }

    return null;
  }

  public static isSwitchType(state: IState): state is IState<SwitchAttributes> {
    return state.entity_id.startsWith('switch.');
  }

  public static isLightType(state: IState): state is IState<LightAttributes> {
    return state.entity_id.startsWith('light.');
  }

  public static isSensorType(state: IState): state is IState<SensorAttributes> {
    return state.entity_id.startsWith('sensor.');
  }

  public static isSelectType(state: IState): state is IState<SelectAttributes> {
    return state.entity_id.startsWith('select.');
  }

  public static isNumberType(state: IState): state is IState<NumberAttributes> {
    return state.entity_id.startsWith('number.');
  }

  public static isThermostatType(state: IState): state is IState<ThermostatAttributes> {
    return state.entity_id.startsWith('climate.');
  }

  public static isInputBooleanType(state: IState): state is IState<InputBooleanAttributes> {
    return state.entity_id.startsWith('input_boolean.');
  }

  public static isInputSelectType(state: IState): state is IState<InputSelectAttributes> {
    return state.entity_id.startsWith('input_select.');
  }

  public static isSceneType(state: IState): state is IState<SceneAttributes> {
    return state.entity_id.startsWith('scene.');
  }
}
