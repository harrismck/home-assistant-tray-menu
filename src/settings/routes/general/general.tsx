import Grid from '@mui/material/Unstable_Grid2';
import {
  FormContainer, SelectElement, SubmitHandler, SwitchElement, useForm,
} from 'react-hook-form-mui';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button, Divider, Stack, Typography,
} from '@mui/material';
import { useSettings } from '../../../utils/use-settings';
import { ISettings } from '../../../store';
import AutoSave from '../../components/form/auto-save';

export type TFormValues = ISettings['general'];

export default function General() {
  const { t } = useTranslation('GENERAL');

  const { settings, saveSettings, refetchSettings } = useSettings();

  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = useCallback(async () => {
    await window.electronAPI.store.exportSettings();
  }, []);

  const handleImport = useCallback(async () => {
    setImportError(null);
    try {
      const result = await window.electronAPI.store.importSettings();
      if (!result.canceled) {
        refetchSettings();
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Import failed');
    }
  }, [refetchSettings]);

  const formDefaultValues = useMemo<TFormValues>(() => (settings.general), [settings]);

  const formContext = useForm<TFormValues>({
    defaultValues: formDefaultValues,
  });

  const { reset } = formContext;

  // reinitialize by hand
  useEffect(() => {
    reset(formDefaultValues);
  }, [formDefaultValues, reset]);

  const onSaveFunction = useCallback<SubmitHandler<TFormValues>>((newSettings) => {
    saveSettings({ general: newSettings });
  }, [saveSettings]);

  return (
    <FormContainer<TFormValues>
      formContext={formContext}
    >
      <Grid container spacing={0} gap={1}>
        <Grid xs={12}>
          <Typography variant="h4" gutterBottom>{t('TITLE')}</Typography>
        </Grid>

        <Grid xs={12}>
          <SelectElement<TFormValues>
            name="theme"
            label={t('OVERWRITE_THEME')}
            options={[{ id: 'system', label: 'System' }, { id: 'light', label: 'light' }, { id: 'dark', label: 'dark' }]}
            fullWidth
          />
        </Grid>

        <Grid xs={12}>
          <SelectElement<TFormValues>
            name="osTheme"
            label={t('OPERATING_SYSTEM_THEME')}
            options={[{ id: 'system', label: 'System' }, { id: 'win10', label: 'Windows 10' }, { id: 'win11', label: 'Windows 11' }]}
            fullWidth
          />
        </Grid>

        <Grid xs={12}>
          <SelectElement<TFormValues>
            name="trayIconColor"
            label={t('TRAY_ICON_COLOR')}
            options={[{ id: 'system', label: 'System' }, { id: 'white', label: 'white' }, { id: 'black', label: 'black' }]}
            fullWidth
          />
        </Grid>

        <Grid xs={12}>
          <SwitchElement<TFormValues> name="showSensorLabels" label={t('SHOW_SENSOR_LABELS')} />
        </Grid>

        <Grid xs={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h6" gutterBottom>{t('BACKUP_TITLE')}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('BACKUP_DESCRIPTION')}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button variant="outlined" onClick={handleExport}>{t('EXPORT_SETTINGS')}</Button>
            <Button variant="outlined" onClick={handleImport}>{t('IMPORT_SETTINGS')}</Button>
          </Stack>
          {importError && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>{importError}</Typography>
          )}
        </Grid>

        <AutoSave
          onSubmit={onSaveFunction}
        />
      </Grid>
    </FormContainer>
  );
}
