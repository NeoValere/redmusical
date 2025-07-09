'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Stack } from '@mui/material';
import { Check, X, PencilSimple } from 'phosphor-react';

interface EditableFieldProps {
  label: string;
  value: string | null | undefined;
  onSave: (newValue: string) => Promise<void>;
  editMode: boolean;
  multiline?: boolean;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption';
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  editMode,
  multiline = false,
  variant = 'body1',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  useEffect(() => {
    if (!editMode) {
      setIsEditing(false);
    }
  }, [editMode]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(currentValue);
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value || '');
    setIsEditing(false);
  };

  if (!editMode && !value) {
    return null; // Don't show anything if not in edit mode and no value exists
  }

  if (isEditing) {
    return (
      <Box>
        <TextField
          label={label}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          fullWidth
          multiline={multiline}
          rows={multiline ? 4 : 1}
          variant="outlined"
          size="small"
          disabled={isSaving}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <IconButton onClick={handleSave} size="small" color="primary" disabled={isSaving}>
            <Check />
          </IconButton>
          <IconButton onClick={handleCancel} size="small" color="secondary" disabled={isSaving}>
            <X />
          </IconButton>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography variant={variant} sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
        {value || (editMode ? <i>Click para editar</i> : '')}
      </Typography>
      {editMode && (
        <IconButton onClick={() => setIsEditing(true)} size="small">
          <PencilSimple />
        </IconButton>
      )}
    </Stack>
  );
};

export default EditableField;
