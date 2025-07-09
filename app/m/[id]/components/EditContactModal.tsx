'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FaLink } from 'react-icons/fa';
import { FaXTwitter, FaTwitch, FaTiktok, FaSquareFacebook, FaYoutube, FaInstagram, FaSpotify, FaSoundcloud } from 'react-icons/fa6';
import { v4 as uuidv4 } from 'uuid';

const SOCIAL_MEDIA_PLATFORMS = [
    { key: 'instagram', name: 'Instagram', regex: /(?:instagram\.com)/, icon: FaInstagram },
    { key: 'x', name: 'X (Twitter)', regex: /(?:twitter\.com|x\.com)/, icon: FaXTwitter },
    { key: 'facebook', name: 'Facebook', regex: /(?:facebook\.com)/, icon: FaSquareFacebook },
    { key: 'youtube', name: 'YouTube', regex: /(?:youtube\.com|youtu\.be)/, icon: FaYoutube },
    { key: 'twitch', name: 'Twitch', regex: /(?:twitch\.tv)/, icon: FaTwitch },
    { key: 'tiktok', name: 'TikTok', regex: /(?:tiktok\.com)/, icon: FaTiktok },
    { key: 'spotify', name: 'Spotify', regex: /(?:spotify\.com)/, icon: FaSpotify },
    { key: 'soundcloud', name: 'SoundCloud', regex: /(?:soundcloud\.com)/, icon: FaSoundcloud },
];

const detectSocialMediaPlatform = (url: string) => {
    for (const platform of SOCIAL_MEDIA_PLATFORMS) {
        if (platform.regex.test(url)) {
            return { platformKey: platform.key, IconComponent: platform.icon };
        }
    }
    return { platformKey: 'unknown', IconComponent: FaLink };
};

type SocialMediaInput = {
  id: string;
  url: string;
  platform: string;
  Icon: React.ElementType;
};

interface EditContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { websiteUrl: string | null, socialMediaLinks: Record<string, string> | null }) => Promise<void>;
  currentWebsiteUrl: string | null;
  currentSocialMediaLinks: Record<string, string> | null;
}

const EditContactModal: React.FC<EditContactModalProps> = ({
  open,
  onClose,
  onSave,
  currentWebsiteUrl,
  currentSocialMediaLinks,
}) => {
  const [websiteUrl, setWebsiteUrl] = useState(currentWebsiteUrl || '');
  const [socialMediaInputs, setSocialMediaInputs] = useState<SocialMediaInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setWebsiteUrl(currentWebsiteUrl || '');
    const initialInputs: SocialMediaInput[] = [];
    if (currentSocialMediaLinks) {
      for (const [platform, url] of Object.entries(currentSocialMediaLinks)) {
        const { IconComponent } = detectSocialMediaPlatform(url);
        initialInputs.push({ id: uuidv4(), url, platform, Icon: IconComponent });
      }
    }
    setSocialMediaInputs(initialInputs);
  }, [open, currentWebsiteUrl, currentSocialMediaLinks]);

  const handleSocialMediaLinkChange = useCallback((id: string, value: string) => {
    setSocialMediaInputs(prev =>
      prev.map(link => {
        if (link.id === id) {
          const { platformKey, IconComponent } = detectSocialMediaPlatform(value);
          return { ...link, url: value, platform: platformKey, Icon: IconComponent };
        }
        return link;
      })
    );
  }, []);

  const handleAddSocialMediaLink = useCallback(() => {
    setSocialMediaInputs(prev => [...prev, { id: uuidv4(), url: '', platform: 'unknown', Icon: FaLink }]);
  }, []);

  const handleRemoveSocialMediaLink = useCallback((id: string) => {
    setSocialMediaInputs(prev => prev.filter(link => link.id !== id));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const socialMediaLinksToSave: Record<string, string> = {};
    socialMediaInputs.forEach(link => {
      if (link.url.trim() && link.platform !== 'unknown') {
        socialMediaLinksToSave[link.platform] = link.url;
      }
    });
    await onSave({
      websiteUrl: websiteUrl || null,
      socialMediaLinks: Object.keys(socialMediaLinksToSave).length > 0 ? socialMediaLinksToSave : null,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Contacto y Enlaces</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <TextField
            label="Sitio Web (Opcional)"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            fullWidth
          />
          {socialMediaInputs.map((link, index) => (
            <Stack key={link.id} direction="row" spacing={1} alignItems="center">
              <TextField
                label={`Enlace ${index + 1}`}
                value={link.url}
                onChange={(e) => handleSocialMediaLinkChange(link.id, e.target.value)}
                fullWidth
                size="small"
                placeholder="https://www.instagram.com/tuperfil"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <link.Icon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton onClick={() => handleRemoveSocialMediaLink(link.id)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
          <Button
            onClick={handleAddSocialMediaLink}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Añadir Enlace
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditContactModal;
