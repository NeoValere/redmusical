import { createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { read_file, write_to_file } from '../../utils';

const themeFile = 'lib/theme/MuiTheme.tsx';

export async function readTheme(): Promise<Theme> {
  try {
    const fileContent = await read_file({ path: themeFile });
    // Extract the theme object from the file content
    const themeMatch = fileContent.match(/createTheme\(([\s\S]*?)\)/);
    if (themeMatch && themeMatch[1]) {
      const themeObjectString = themeMatch[1].trim();
      // Safely evaluate the theme object string
      const themeObject = eval(`(${themeObjectString})`);
      return createTheme(themeObject);
    } else {
      console.error('Could not extract theme object from file content');
      return createTheme({});
    }
  } catch (error) {
    console.error('Error reading theme file:', error);
    return createTheme({});
  }
}

export async function writeTheme(theme: Theme): Promise<void> {
  try {
    // Convert the theme object back to a string
    const themeObjectString = JSON.stringify(theme.palette);
    // Read the original theme file
    const originalFileContent = await read_file({ path: themeFile });
    // Replace the palette section in the original file content
    const updatedFileContent = originalFileContent.replace(
      /palette: {[\s\S]*?}/,
      `palette: ${themeObjectString}`
    );
    // Write the updated content back to the theme file
    await write_to_file({ path: themeFile, content: updatedFileContent });
  } catch (error) {
    console.error('Error writing theme file:', error);
  }
}
