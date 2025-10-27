import fs from 'fs-extra';

/**
 * Adds the Tailwind CSS import and plugin to a vite.config.ts file
 * @param {string} configPath - Path to the vite.config.ts file
 */
export async function addTailwindToViteConfig(configPath) {
  try {
    // Read the existing config file
    let content = await fs.readFile(configPath, 'utf-8');

    // Check if tailwindcss is already imported
    if (content.includes("from '@tailwindcss/vite'")) {
      console.log('Tailwind CSS is already configured in vite.config.ts');
      return;
    }

    // Add the import statement after the last import
    const importStatement = "import tailwindcss from '@tailwindcss/vite'";

    // Find the position after the last import statement
    const importRegex = /import\s+.*?from\s+['"].*?['"]/g;
    const imports = [...content.matchAll(importRegex)];

    if (imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const insertPosition = lastImport.index + lastImport[0].length;

      // Insert the tailwindcss import after the last import
      content =
        content.slice(0, insertPosition) +
        '\n' + importStatement +
        content.slice(insertPosition);
    } else {
      // If no imports found, add at the beginning
      content = importStatement + '\n' + content;
    }

    // Add tailwindcss() to the plugins array
    // Find the plugins array and add tailwindcss() as the first item
    const pluginsRegex = /plugins:\s*\[([\s\S]*?)\]/;
    const pluginsMatch = content.match(pluginsRegex);

    if (pluginsMatch) {
      const pluginsContent = pluginsMatch[1];

      // Determine the indentation level
      const lines = pluginsContent.split('\n');
      const firstNonEmptyLine = lines.find(line => line.trim()) || '';
      const indentation = firstNonEmptyLine.match(/^\s*/)?.[0] || '    ';

      // Build the new plugins content
      let newPluginsContent;
      if (pluginsContent.trim() === '') {
        // Empty plugins array
        newPluginsContent = `\n${indentation}tailwindcss()\n  `;
      } else {
        // Add tailwindcss() as the first plugin
        // Remove leading whitespace from pluginsContent and add it back with proper formatting
        const trimmedPlugins = pluginsContent.trimStart();
        newPluginsContent = `\n${indentation}tailwindcss(),\n${indentation}${trimmedPlugins}`;
      }

      // Replace the plugins array content
      content = content.replace(
        pluginsRegex,
        `plugins: [${newPluginsContent}]`
      );
    }

    // Write the modified content back to the file
    await fs.writeFile(configPath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to modify vite.config.ts: ${error.message}`);
  }
}
