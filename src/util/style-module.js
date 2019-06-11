export default ({ themeName, themeFor, include, styles }) => {
  const theme = document.createElement('dom-module');
  theme.id = themeName;
  if (themeFor) {
    theme.setAttribute('theme-for', themeFor);
  }
  theme.innerHTML = `
    <template>
      <style ${include ? `include="${include}"` : ''}>
        ${styles}
      </style>
    </template>
  `;
  theme.register(theme.id);
};
