import styleModule from './style-module';

export const colorVars = [
  { name: '--vcf-network-red', value: '#d0021c' },
  { name: '--vcf-network-orange', value: '#f5a623' },
  { name: '--vcf-network-yellow', value: '#f8e81d' },
  { name: '--vcf-network-green', value: '#7dd421' },
  { name: '--vcf-network-dark-green', value: '#417506' },
  { name: '--vcf-network-blue', value: '#8a562b' },
  { name: '--vcf-network-purple', value: '#4990e2' },
  { name: '--vcf-network-violet', value: '#9013fe' },
  { name: '--vcf-network-brown', value: '#bd10e0' }
];

export const colors = () => {
  styleModule({
    themeName: 'vcf-network-colors',
    styles: `
      :host {
      ${colorVars.map((c, i) => `  ${c.name}: ${c.value};\n`).join('')}
      }
    `
  });
};
